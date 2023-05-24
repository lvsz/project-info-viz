document.addEventListener('DOMContentLoaded', function(event) {
  const macBaseURL =
      'https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/output-data/';
  const macRawCSV = macBaseURL + 'big-mac-raw-index.csv';
  const macAdjCSV = macBaseURL + 'big-mac-adjusted-index.csv';
  const cpiBaseURL =
      'https://raw.githubusercontent.com/lvsz/project-info-viz/node-server/data/rateinf/';
  const getCpiCSV = (req) => `${cpiBaseURL}CPI_${req}.csv`;

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

  var mapChart;
  var currencyValueChart;
  var correlationChart;
  var BMorCPIChart;
  var ExpenseChart;

  var countries;

  Promise
      .all([
        d3.csv(macRawCSV),
        d3.csv("https://raw.githubusercontent.com/lvsz/project-info-viz/main/data/bigmac/raw-index-valued.csv"),
        d3.csv(getCpiCSV(chosenCPI)),
        d3.csv(
            'https://raw.githubusercontent.com/lvsz/project-info-viz/main/data/world_bank/WB-DATA.csv'),
        fetch(
            'https://cdn.jsdelivr.net/npm/world-atlas/countries-50m.json')  // placeholder
            .then((r) => r.json()),
      ])
      .then(function(values) {
        // D3
        RAW_INDEX = values[0];
        ADJ_INDEX = values[1];
        console.log(ADJ_INDEX)
        initializeTheCurrencyComparison();

        // cpi
        CPI = values[2];
        CPI_labels = getLabels(CPI, 'Date');
        CPI_values = getValues(CPI, 'Value');
        createCorrelationList();

        // expense test
        WORLD_BANK = values[3];
        const promptName = worldBankMapper(chosenCountry);
        expenseList =
            WORLD_BANK.filter((entry) => entry.country_name == promptName);

        // World Atlas
        countries =
            ChartGeo.topojson.feature(values[4], values[4].objects.countries)
                .features;

        initDashboard();
      });

  function initializeTheCurrencyComparison() {
    const promptName = bigMacMapper(chosenCountry);
    console.log(promptName)
    let cmp = promptName == comparisonCountry ? altComparisonCountry :
                                                comparisonCountry;
    let thisCountry = ADJ_INDEX.filter((entry) => entry.iso_a3 == promptName)
    let thisIdx = 0, thatIdx = 0;

    resDates = [];
    resValues = [];
    if (thisCountry != undefined) {
      console.log(thisCountry.length);
      while (thisIdx < thisCountry.length) {
        const thisYear = Number.parseInt(thisCountry[thisIdx].date)
        const exchange_rate = Number.parseFloat(thisCountry[thisIdx].over_under_valued)
        console.log(exchange_rate)
          resDates.push(thisYear);
          resValues.push(Math.round(exchange_rate));
          thisIdx += 1;
          thatIdx += 1;
      }
    }
  }

  function initDashboard() {
    let dates = [...new Set(RAW_INDEX.map((row) => row.date))];
    chosenDate = dates[0];

    initTimeSlider(dates);
    mapChart = initMap();
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
    // console.log(RAW_INDEX);
    const promptName = bigMacMapper(country);
    let answer = RAW_INDEX.filter(
        (entry) => entry.iso_a3 == promptName && entry.date == chosenDate);
    // console.log(answer);
    return Number.parseFloat(answer.at(0)?.dollar_price);
  }

  // get the labels, a date
  function getLabels(Array2D, decider) {
    return Array2D.map((x) => x[decider].toString().substring(0, 4));
  }
  // get the values, an actual value like currency
  function getValues(Array2D, decider) {
    return Array2D.map((x) => Number(x[decider]));
  }

  // do we have the year in this bm also in the cpi
  function isExistingYear(yearStr) {
    return CPI_labels.includes(yearStr);
  }

  // creates a sublist of the bm with only years of the cpi
  function createCorrelationList() {
    const promptName = bigMacMapper(chosenCountry);
    // console.log(promptName)
    correlationList = RAW_INDEX.filter(
        (entry) => entry.iso_a3 == promptName &&
            isExistingYear(entry.date.substring(0, 4)));
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
    chosenCPI = cpiMap[chosenCountry];
    if (chosenCPI !== undefined) {
      Promise.all([d3.csv(getCpiCSV(chosenCPI))]).then(function(values) {
        // cpi
        CPI = values[0];
        CPI_labels = getLabels(CPI, 'Date');
        CPI_values = getValues(CPI, 'Value');
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
    }
  }

  function getColour(val) {
    if (val >= 0) {
      return '#9BD0F5';
    } else {
      return '#FFB1C1';
    }
  }

  function changeCurrency(){
      if(chosenComparisonCurrency == 'dollar_price'){
        chosenComparisonCurrency = 'local_price'
      }else{
        chosenComparisonCurrency = 'dollar_price'
      }
      updateCurrencyValueChart();
  }

  function initButton(){
    const ctx = document.getElementById("button");
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
            label: 'Comparison of the value with USA in percentage',//+ chosenComparisonCurrency,
            data: resValues,
            borderWidth: 1,
            backgroundColor: resValues.map((val) => getColour(val)),
          },
        ],
      },
      options: {indexAxis: 'x', scales: {y: {beginAtZero: true}}},
    });
  }

  function updateCurrencyValueChart() {
    console.log('updating BMorCPIChart');
    initializeTheCurrencyComparison();
    currencyValueChart.data.labels = resDates;
    currencyValueChart.data.datasets[0].data = resValues;
    // currencyValueChart.data.datasets[0].label = 'Comparison of the value with USA',//+ chosenComparisonCurrency;
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
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: getLabels(expenseList, 'year'),
        datasets: [
          {
            label: 'the yearly expense of chosen country',
            data: getValues(expenseList, 'value'),
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

    ExpenseChart.data.labels = getLabels(expenseList, 'year');
    ExpenseChart.data.datasets[0].data = getValues(expenseList, 'value');

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

  function initMap() {
    const ctx = document.getElementById('world-map');
    mapChart = new Chart(ctx, {
      type: 'choropleth',
      data: {
        labels: countries.map((d) => d.properties.name),
        datasets: [
          {
            label: 'Countries',
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
            display: false,
          },
        },
        scales: {
          projection: {
            axis: 'x',
            projection: 'equalEarth',
          },
        },
        onClick: (e) => {
          const res = mapChart.getElementsAtEventForMode(
              e, 'nearest', {intersect: true}, true);
          chosenCountry = mapChart.data.labels[res[0]?.index];
          // console.log(chosenCountry);
          changeData();
        },
      },
    });
    return mapChart;
  }

  function updateMap() {
    console.log('updating map');
    console.log(
        mapChart.data.datasets.filter((e) => e.label == 'Countries')[0].data);

    mapChart.data.datasets.filter((e) => e.label == 'Countries')[0].data =
        countries.map((d) => ({
                        feature: d,
                        value: lookupBM(d.properties.name),
                      }));

    mapChart.update();
  }
});
