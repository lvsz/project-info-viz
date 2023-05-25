document.addEventListener('DOMContentLoaded', function(event) {
  const macBaseURL =
      'https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/output-data';
  const macRawCSV = `${macBaseURL}/big-mac-raw-index.csv`;
  const macAdjCSV = `${macBaseURL}/big-mac-adjusted-index.csv`;
  const cpiBaseURL =
      'https://raw.githubusercontent.com/lvsz/project-info-viz/main/data/rateinf';
  const getCpiCSV = (req) => `${cpiBaseURL}/CPI_${req}.csv`;

  var chosenCountry = 'Euro area';
  var comparisonCountry = 'USA';
  var altComparisonCountry = 'EUZ';
  var chosenCPI = 'EUR';
  var chosenDate;
  var chosenComparisonCurrency = 'dollar_price';
  var RAW_INDEX;
  var ADJ_INDEX;
  var CPI;
  var CPI_labels;
  var CPI_values;
  var correlationList;
  var WORLD_BANK;
  var expenseList;
  var resDates = [];
  var resValues = [];
  var resPrices = [];

  var mapChart;
  var currencyValueChart;
  var correlationChart;
  var BMorCPIChart;
  var ExpenseChart;

  var countries;

  Promise
      .all([
        d3.csv(macRawCSV),
        d3.csv(macAdjCSV),
        d3.csv(getCpiCSV(chosenCPI)),
        d3.csv(
            'https://raw.githubusercontent.com/lvsz/project-info-viz/main/data/world_bank/WB-DATA.csv'),
        fetch(
            'https://cdn.jsdelivr.net/npm/world-atlas/countries-50m.json')  // placeholder
            .then((r) => r.json()),
      ])
      .then(function(data) {
        // D3
        RAW_INDEX = data[0];
        ADJ_INDEX = data[1];
        initializeTheCurrencyComparison();

        // cpi
        CPI = data[2];
        const {labels, values} = getLabelsAndValues(CPI, 'Date', 'Value');
        CPI_labels = labels;
        CPI_values = values;
        createCorrelationList();

        // expense test
        WORLD_BANK = data[3];
        const promptName = worldBankMapper(chosenCountry);
        expenseList =
            WORLD_BANK.filter((entry) => entry.country_name == promptName);

        // World Atlas
        countries =
            ChartGeo.topojson.feature(data[4], data[4].objects.countries)
                .features;



  // ---------------------------//
  //       AXIS  AND SCALE      //
  // ---------------------------//

  // Add X axis
  var x = d3.scaleLinear()
    .domain([-10, 120])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(3));

  // Add X axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height+50 )
      .text("Real exchange rate");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([-0.5, 0.5])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add Y axis label:
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", 0)
      .attr("y", -20 )
      .text("Big Mac exchange rate")
      .attr("text-anchor", "start")

  // Add a scale for bubble size
  var z = d3.scaleLinear()
    .domain([0, 31])
    .range([ 2, 50]);

  // Add a scale for bubble color
          var myColor = d3.scaleOrdinal().domain(Object.keys(iso_a3))
              .range(d3.schemeSet1);


  // ---------------------------//
  //      TOOLTIP               //
  // ---------------------------//

  // -1- Create a tooltip div that is hidden by default:
  var tooltip = d3.select("#my_dataviz")
    .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")

  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  var showTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .html(console.log(Object.entries(d)) + "Country: " + d.target.circle.bubbles)
      .style("left", (d3.mouse(this)[0]+30) + "px")
      .style("top", (d3.mouse(this)[1]+30) + "px")
  }
  var moveTooltip = function(d) {
    tooltip
      .style("left", (d3.mouse(this)[0]+30) + "px")
      .style("top", (d3.mouse(this)[1]+30) + "px")
  }
  var hideTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }


  // ---------------------------//
  //       HIGHLIGHT GROUP      //
  // ---------------------------//

  // What to do when one group is hovered
  var highlight = function(d){
    // reduce opacity of all groups
    //d3.selectAll(".bubbles").style("opacity", .05)
    // expect the one that is hovered
    //d3.selectAll("."+d).style("opacity", 1)
    return undefined;
  }

  // And when it is not hovered anymore
  var noHighlight = function(d){
    d3.selectAll(".bubbles").style("opacity", 1)
  }


  // ---------------------------//
  //       CIRCLES              //
  // ---------------------------//

  // Add dots
          svg.append('g')
              .selectAll("dot")
              .data(RAW_INDEX)
              .enter()
              .append("circle")
              .attr("class", function(d) {  return "bubbles " + d.iso_a3 })
              .attr("cx", function (d) { return x(d.dollar_ex); } )
              .attr("cy", function (d) { return y(d.USD / d.dollar_price); } )
              .attr("r", function (d) { return z(d.dollar_price); } )
              .style("fill", function (d) { return myColor(d.iso_a3); } )
          // -3- Trigger the functions for hover
              .on("mouseover", showTooltip )
              .on("mousemove", moveTooltip )
              .on("mouseleave", hideTooltip )



    // ---------------------------//
    //       LEGEND              //
    // ---------------------------//

    // Add legend: circles
    var valuesToShow = [10000000, 100000000, 1000000000]
    var xCircle = 390
    var xLabel = 440
    svg
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("circle")
        .attr("cx", xCircle)
        .attr("cy", function(d){ return height - 100 - z(d) } )
        .attr("r", function(d){ return z(d) })
        .style("fill", "none")
        .attr("stroke", "black")

    // Add legend: segments
    svg
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("line")
        .attr('x1', function(d){ return xCircle + z(d) } )
        .attr('x2', xLabel)
        .attr('y1', function(d){ return height - 100 - z(d) } )
        .attr('y2', function(d){ return height - 100 - z(d) } )
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))

    // Add legend: labels
    svg
      .selectAll("legend")
      .data(valuesToShow)
      .enter()
      .append("text")
        .attr('x', xLabel)
        .attr('y', function(d){ return height - 100 - z(d) } )
        .text( function(d){ return d/1000000 } )
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')

    // Legend title
    svg.append("text")
      .attr('x', xCircle)
      .attr("y", height - 100 +30)
      .text("Population (M)")
      .attr("text-anchor", "middle")

    // Add one dot in the legend for each name.
    var size = 20
    var allgroups = ["Asia", "Europe", "Americas", "Africa", "Oceania"]
    svg.selectAll("myrect")
      .data(allgroups)
      .enter()
      .append("circle")
        .attr("cx", 390)
        .attr("cy", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return myColor(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add labels beside legend dots
    svg.selectAll("mylabels")
      .data(allgroups)
      .enter()
      .append("text")
        .attr("x", 390 + size*.8)
        .attr("y", function(d,i){ return i * (size + 5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return myColor(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
        initDashboard();
      });

  function initializeTheCurrencyComparison() {
    const promptName = bigMacMapper(chosenCountry);
    console.log(promptName);
    let thisCountry = RAW_INDEX.filter((entry) => entry.iso_a3 == promptName);
    let thatCountry =
        RAW_INDEX.filter((entry) => entry.iso_a3 == comparisonCountry);

    if (thisCountry?.length > 0) {
      resDates = [];
      resValues = [];
      resPrices = [];
      let thisIdx = 0;
      console.log(thisCountry.length);
      while (thisIdx < thisCountry.length) {
        const thisYear = Number.parseInt(thisCountry[thisIdx].date);
        // const exchange_rate =
        // Number.parseFloat(thisCountry[thisIdx].over_under_valued)
        const exchange_rate = Number.parseFloat(thisCountry[thisIdx].USD * 100);
        const thisPrice = Number.parseFloat(thisCountry[thisIdx].dollar_price);
        const thatPrice = Number.parseFloat(thatCountry[thisIdx].dollar_price);
        console.log(exchange_rate);
        resDates.push(thisYear);
        resValues.push(exchange_rate.toFixed(2));
        resPrices.push([thisPrice.toFixed(2), thatPrice.toFixed(2)]);
        thisIdx += 1;
      }
      if (currencyValueChart) {
        currencyValueChart.data.datasets[0].label =
            `Big Mac price difference: ${promptName} vs USA`;
      }
    }
  }

  function initDashboard() {
    let dates = [...new Set(RAW_INDEX.map((row) => row.date))];
    let countries = [...new Set(RAW_INDEX.map((row) => row.name))];
    chosenDate = dates[0];

    initTimeSlider(dates);
    mapChart = initMap();
    initCountrySelector(countries, chosenCountry);
    currencyValueChart = initCurrencyValueChart();
    correlationChart = initCorrelationChart();
    BMorCPIChart = initIndividualChart();
    ExpenseChart = initExpenseChart();
    // initButton();
  }

  function updateDashboard() {
    updateMap();
  }

  function bigMacMapper(country) {
    return bigMacMap[country] || null;
  }

  function worldBankMapper(country) {
    return worldBankMap[country] || country;
  }

  function lookupBM(country) {
    const promptName = bigMacMapper(country);
    let answer = RAW_INDEX.filter(
        (entry) => entry.iso_a3 == promptName && entry.date == chosenDate);
    return Number.parseFloat(answer.at(0)?.dollar_price);
  }

  // get the labels (year) and values (number)
  function getLabelsAndValues(Array2D, labelKey, valueKey) {
    const getLabelValPair = (x) =>
        ({label: Number.parseInt(x[labelKey]), value: Number(x[valueKey])});
    const pairs =
        Array2D.map(getLabelValPair).sort((a, b) => a.label - b.label);
    return {
      labels: pairs.map((x) => x.label),
      values: pairs.map((x) => x.value)
    };
  }

  // only get the labels, a date
  function getLabels(Array2D, decider) {
    return getLabelsAndValues(Array2D, decider).labels;
  }

  // do we have the year in this bm also in the cpi
  function isExistingYear(year) {
    return CPI_labels.includes(year);
  }

  // creates a sublist of the bm with only years of the cpi
  function createCorrelationList() {
    const promptName = bigMacMapper(chosenCountry);
    // console.log(promptName)
    correlationList = RAW_INDEX.filter(
        (entry) => entry.iso_a3 == promptName &&
            isExistingYear(Number.parseInt(entry.date)));
  }

  // calculate the correlation between the average cpi in one year and a bm
  // value
  function createCorrelationValuesList(BM, decider) {
    let resList = [];
    let cpiCtr = 0;
    let average = 0;
    let averageCtr = 0;
    for (let i = 0; i < BM.length; i++) {
      while (Number(CPI_labels[cpiCtr]) <
             Number(String(BM[i].date).substring(0, 4))) {
        cpiCtr += 1;
      }
      while (cpiCtr < CPI_labels.length &&
             CPI_labels[cpiCtr] == String(BM[i].date).substring(0, 4)) {
        averageCtr += 1;
        cpiCtr += 1;
        average += CPI_values[cpiCtr];
      }
      average = average / averageCtr;
      resList.push(Number(BM[i][decider] / average));
      if (i + 1 < BM.length) {
        if (String(BM[i].date).substring(0, 4) ==
            String(BM[i + 1].date).substring(0, 4)) {
          cpiCtr -= averageCtr;
        }
      }
      averageCtr = 0;
      average = 0;
    }
    return resList;
  }

  function initTimeSlider(dates) {
    let options = {year: 'numeric', month: 'long'};
    let slides = dates.map(
        (date) => `<div class="swiper-slide" data-date="${date}">${
            new Date(date).toLocaleDateString('en-US', options)}</div>`);

    let swiper = new Swiper('#time-slider', {
      // Navigation arrows
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      // And if we need scrollbar
      scrollbar: {
        el: '.swiper-scrollbar',
      },
      direction: 'horizontal',
      slidesPerView: 1,
      centeredSlides: true,
      paginationClickable: true,
      spaceBetween: 30,
      mousewheel: {
        enabled: true,
      },
      parallax: true,
      speed: 600,
    });

    swiper.appendSlide(slides);

    // console.log("Current date: ", dates[0]);

    swiper.on('slideChange', function() {
      // console.log("Current date: ",
      // $(swiper.slides[swiper.activeIndex]).data("date"));
      chosenDate = $(swiper.slides[swiper.activeIndex]).data('date');
      updateDashboard();
    });
  }

  function changeData() {
    console.log(chosenCountry);
    chosenCPI = cpiMap[chosenCountry];
    const iso = iso_a3[chosenCountry];
    document.querySelector('#countrySelector').value =
        euroZone.includes(chosenCountry) ? 'Euro area' : from_iso_a3[iso];
    if (chosenCPI !== undefined) {
      Promise.all([d3.csv(getCpiCSV(chosenCPI))]).then(function(data) {
        // cpi
        CPI = data[0];
        const {labels, values} = getLabelsAndValues(CPI, 'Date', 'Value')
        CPI_labels = labels;
        CPI_values = values;
        createCorrelationList();

        updateCorrelationChart();
        updateBMorCPIChart();
        updateExpenseChart();
        updateCurrencyValueChart();
      });
      // change this to lookup the data for the given country and change the
      // graph's labels and data
      //  chart.data.labels =labels for the chosenCountry
      //  chart.data.datasets[0]. data =labels for the chosenCountry
    } else {
      // cpi
      CPI = [];
      CPI_labels = [];
      CPI_values = [];
      createCorrelationList();

      updateCorrelationChart();
      updateBMorCPIChart();
      updateExpenseChart();
      updateCurrencyValueChart();
    }
  }

  function getColour(val) {
    if (val >= 0) {
      return '#9BD0F5';
    } else {
      return '#FFB1C1';
    }
  }

  function changeCurrency() {
    if (chosenComparisonCurrency == 'dollar_price') {
      chosenComparisonCurrency = 'local_price';
    } else {
      chosenComparisonCurrency = 'dollar_price';
    }
    updateCurrencyValueChart();
  }

  function initButton() {
    const ctx = document.getElementById('button');
    ctx.onclick = changeCurrency;
  }

  function initCurrencyValueChart() {
    const ctx = document.getElementById('comparative-cpi-chart');
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: resDates,
        datasets: [
          {
            label: 'Big Mac price difference',
            //'Comparison of the value with USA in percentage',  //+
            // chosenComparisonCurrency,
            data: resValues,
            borderWidth: 1,
            backgroundColor: resValues.map((val) => getColour(val)),
          },
        ],
      },
      options: {
        indexAxis: 'x',
        scales: {y: {beginAtZero: true}},
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const prices = resPrices[context.dataIndex];
                return prices && ` ${comparisonCountry} price: $${prices[1]} `;
              },
              label: function(context) {
                const prices = resPrices[context.dataIndex];
                const code = bigMacMapper(chosenCountry);
                return `${code} price: $${prices[0]} `;
              },
              footer: function(context) {
                const val = context[0].parsed.y;
                if (typeof val == 'number' && val > 0) {
                  return `${val}% more expensive`;
                } else {
                  return `${(-val).toFixed(2)}% cheaper`;
                }
              },
            },
          },
        },
      },
    });
  }

  function updateCurrencyValueChart() {
    console.log('updating BMorCPIChart');
    initializeTheCurrencyComparison();
    currencyValueChart.data.labels = resDates;
    currencyValueChart.data.datasets[0].data = resValues;
    // currencyValueChart.data.datasets[0].label = 'Comparison of the value with
    // USA',//+ chosenComparisonCurrency;
    currencyValueChart.data.datasets[0].backgroundColor =
        resValues.map((val) => getColour(val));
    currencyValueChart.update();
  }

  function initIndividualChart() {
    const ctx = document.getElementById('nominal-cpi-chart');
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: CPI_labels,
        datasets: [
          {label: 'CPI for chosen country', data: CPI_values, borderWidth: 1},
        ],
      },
      options: {scales: {y: {beginAtZero: true}}},
    });
  }

  function updateBMorCPIChart() {
    console.log('updating BMorCPIChart');

    BMorCPIChart.data.labels = CPI_labels;
    BMorCPIChart.data.datasets[0].data = CPI_values;
    BMorCPIChart.update();
  }

  // GC.XPN.TOTL.GD.ZS
  function initExpenseChart() {
    const ctx = document.getElementById('annual-expense-chart');
    const {labels, values} = getLabelsAndValues(expenseList, 'year', 'value');
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'the yearly expense of chosen country',
            data: values,
            borderWidth: 1,
          },
        ],
      },
      options: {scales: {y: {beginAtZero: true}}},
    });
  }
  function updateExpenseChart() {
    console.log('updating Expense chart');

    const promptName = worldBankMapper(chosenCountry);
    expenseList =
        WORLD_BANK.filter((entry) => entry.country_name == promptName);

    const {labels, values} = getLabelsAndValues(expenseList, 'year', 'value');
    ExpenseChart.data.labels = labels;
    ExpenseChart.data.datasets[0].data = values;

    ExpenseChart.update();
  }

  function initCorrelationChart() {
    const ctx = document.getElementById('cpi-big-mac-correlation-chart');
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: getLabels(correlationList, 'date'),
        datasets: [
          {
            label: 'correlation between CPI and Big mac index',
            data: createCorrelationValuesList(
                correlationList,
                'dollar_price'),  // getValues(correlationList, 'local_price'),
            borderWidth: 1,
          },
        ],
      },
      options: {scales: {y: {beginAtZero: true}}},
    });
  }

  function updateCorrelationChart() {
    console.log('updating correlation chart');

    correlationChart.data.labels = getLabels(correlationList, 'date');
    correlationChart.data.datasets[0].data =
        createCorrelationValuesList(correlationList, 'dollar_price');

    correlationChart.update();
  }

  function initCountrySelector(countries, defaultCountry) {
    let selector = document.querySelector('#countrySelector');
    countries.sort().forEach((country) => {
      var opt = document.createElement('option');
      opt.value = country;
      opt.innerHTML = country;
      selector.appendChild(opt);
    });
    selector.value = defaultCountry;

    selector.addEventListener('change', () => {
      console.log(selector.value);
      chosenCountry = selector.value;
      changeData();
    });
  }

  function initMap() {
    const ctx = document.getElementById('world-map');
    mapChart = new Chart(ctx, {
      type: 'choropleth',
      data: {
        labels: countries.map((d) => d.properties.name),
        datasets: [
          {
            label: 'Price of a Big Mac across the world (adjusted to USD)',
            data: countries.map((d) => ({
                                  feature: d,
                                  value: lookupBM(d.properties.name),
                                })),
          },
        ],
      },
      options: {
        showOutline: true,
        showGraticule: true,
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const cost = Number.parseFloat(context.formattedValue);
                const country = context.raw.feature.properties.name;
                if (!Number.isNaN(cost)) {
                    return `${country}: $${cost.toFixed(2)}`;
                } else {
                    return country;
                }
              },
            },
          },
        },
        scales: {
          projection: {
            axis: 'x',
            projection: 'equirectangular',
          },
        },
        onClick: (e) => {
          const res = mapChart.getElementsAtEventForMode(
              e, 'nearest', {intersect: true}, true);
          const choice = mapChart.data.labels[res[0]?.index];
          // only make a change when part of Big Mac data set
          if (bigMacMapper(choice)) {
            chosenCountry = choice;
            changeData();
          } else {
            console.log('Unsupported area: ', choice);
          }
        },
      },
    });
    return mapChart;
  }

  function updateMap() {
    console.log('updating map');
    // console.log(
    //     mapChart.data.datasets.filter((e) => e.label ==
    //     'Countries')[0].data);

    mapChart.data.datasets.filter((e) => e.label == 'Countries')[0].data =
        countries.map((d) => ({
                        feature: d,
                        value: lookupBM(d.properties.name),
                      }));

    mapChart.update();
  }


// set the dimensions and margins of the graph
var margin = {top: 40, right: 150, bottom: 60, left: 30},
    width = 500 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
});

var oldmap = [];
document.getElementById('hide-btn').addEventListener('click', function() {
  let worldmap = document.getElementById('map-and-slider');
  oldmap = [...worldmap.childNodes];
  worldmap.replaceChildren();
  document.getElementById('hide-btn').style.display = 'none';
  document.getElementById('show-btn').style.display = 'block';
});

document.getElementById('show-btn').addEventListener('click', function() {
  let worldmap = document.getElementById('map-and-slider');
  worldmap.replaceChildren(...oldmap);
  document.getElementById('hide-btn').style.display = 'block';
  document.getElementById('show-btn').style.display = 'none';
});
