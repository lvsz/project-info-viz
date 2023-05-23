document.addEventListener('DOMContentLoaded', function(event) {
  const ctx = document.getElementById('myChart');
  const comparisonCahrt = document.getElementById('CPItoBigMacComparisonChart');
  const expenseChart = document.getElementById('expenseChart');
  const macBaseURL =
      'https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/output-data/';
  const macRawCSV = macBaseURL + 'big-mac-raw-index.csv';
  const macAdjCSV = macBaseURL + 'big-mac-adjusted-index.csv';
  const cpiBaseURL =
      'https://raw.githubusercontent.com/lvsz/project-info-viz/node-server/data/rateinf/';
  const getCpiCSV = (req) => `${cpiBaseURL}CPI_${req}.csv`;

  var chosenCountry = 'Euro area';
  var comparisonCountry = 'United States';
  var chosenCPI = 'EUR';
  var chosenDate;
  var chosenBaseCurrency = 'EUR';
  var RAW_INDEX;
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
        initializeTheCurrencyComparison();

        // cpi
        CPI = values[1];
        CPI_labels = getLabels(CPI, 'Date');
        CPI_values = getValues(CPI, 'Value');
        createCorrelationList();

        // expense test
        WORLD_BANK = values[2];
        const promptName = worldBankMapper(chosenCountry);
        expenseList =
            WORLD_BANK.filter((entry) => entry.country_name == promptName);

        // World Atlas
        countries =
            ChartGeo.topojson.feature(values[3], values[3].objects.countries)
                .features;

        initDashboard();
      });

  function initializeTheCurrencyComparison() {
    const promptName = bigMacMapper(chosenCountry);
    var answer1 = RAW_INDEX.filter((entry) => entry.name == promptName);
    var answer2 = RAW_INDEX.filter((entry) => entry.name == comparisonCountry);
    var curCountryCTR = 0;
    var comparisonCountryCTR = 0;
    resDates = [];
    resValues = [];
    if ((typeof answer1 === 'undefined') == false) {
      console.log(answer1.length);
      while (curCountryCTR < answer1.length &&
             comparisonCountryCTR < answer2.length) {
        var year1 =
            Number(String(answer1[curCountryCTR]['date']).substring(0, 4));
        var year2 = Number(
            String(answer2[comparisonCountryCTR]['date']).substring(0, 4));
        var value1 = Number(answer1[curCountryCTR]['dollar_price']);
        var value2 = Number(answer2[comparisonCountryCTR]['dollar_price']);
        if (year1 == year2) {
          resDates.push(year1);
          resValues.push(((value2 - value1) / value2) * 100);
          curCountryCTR += 1;
          comparisonCountryCTR += 1;
        } else if (year1 < year2) {
          curCountryCTR += 1;
        } else if (year1 > year2) {
          comparisonCountryCTR += 1;
        }
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
  }

  function updateDashboard() {
    updateMap();
  }

  // mapping between a country on the map and the bm data
  const euroZone = [
    'Austria',   'Belgium',    'Croatia',  'Republic of Cyprus',
    'Estonia',   'Finland',    'France',   'Germany',
    'Greece',    'Ireland',    'Italy',    'Latvia',
    'Lithuania', 'Luxembourg', 'Malta',    'Netherlands',
    'Portugal',  'Slovakia',   'Slovenia', 'Spain',
    'Euro area',
  ];

  const bigMacMap = {
    'United States of America': 'United States',
    'United Kingdom': 'Britain',
    __proto__: Object.fromEntries(euroZone.map((x) => [x, 'Euro area'])),
  };

  const cpiMap = {
    'Argentina': 'ARG',
    'Australia': 'AUS',
    'Canada': 'CAN',
    'Britain': 'GBR',
    'Japan': 'JPN',
    'New Zealand': 'NZL',
    'Russia': 'RUS',
    'United States of America': 'USA',
    'Switzerland': 'CHE',
    __proto__: Object.fromEntries(euroZone.map((x) => [x, 'EUR'])),
  };

  const worldBankMap = {
    'Dem. Rep. Congo': 'Congo, Dem. Rep.',
    'Central African Rep.': 'Central African Republic',
    'North Korea': 'Korea, Rep.',
    'South Korea': 'Korea, Rep.',
    'Egypt': 'Egypt, Arab Rep.',
    'Venezuela': 'Venezuela, RB',
    'Russia': 'Russian Federation',
    __proto__: bigMacMap,
  };


  function bigMacMapper(country) {
    return bigMacMap[country] || country;
  }

  function worldBankMapper(country) {
    return worldBankMap[country] || country;
  }

  function lookupBM(country) {
    // console.log(RAW_INDEX);
    const promptName = bigMacMapper(country);
    var answer = RAW_INDEX.filter(
        (entry) => entry.name == promptName && entry.date == chosenDate);
    // console.log(answer);
    if (typeof answer[0] === 'undefined') {
      answer = null;
    } else {
      answer = Number(answer[0]['dollar_price']);
    }
    return answer;
  }

  // get the labels, a date
  function getLabels(Array2D, decider) {
    var resList = [];
    for (let i = 0; i < Array2D.length; i++) {
      resList.push(String(Array2D[i][decider]).substring(0, 4));
    }
    return resList;
  }
  // get the values, an actual value like currency
  function getValues(Array2D, decider) {
    var resList = [];
    for (let i = 0; i < Array2D.length; i++) {
      resList.push(Number(Array2D[i][decider]));
    }
    return resList;
  }

  // do we have the year in this bm also in the cpi
  function isExistingYear(dateBM) {
    return CPI_labels.includes(String(dateBM).substring(0, 4));
  }

  // creates a sublist of the bm with only years of the cpi
  function createCorrelationList() {
    const promptName = bigMacMapper(chosenCountry);
    // console.log(promptName)
    var answer = RAW_INDEX.filter(
        (entry) => entry.name == promptName && isExistingYear(entry.date));
    if (typeof answer[0] === 'undefined') {
      answer = [];
    } else {
    }
    correlationList = answer;
  }

  // calculate the correlation between the average cpi in one year and a bm
  // value
  function createCorrelationValuesList(BM, decider) {
    var resList = [];
    var cpiCtr = 0;
    var average = 0;
    var averageCtr = 0;
    for (let i = 0; i < BM.length; i++) {
      while (Number(CPI_labels[cpiCtr]) <
             Number(String(BM[i]['date']).substring(0, 4))) {
        cpiCtr += 1;
      }
      while (cpiCtr < CPI_labels.length &&
             CPI_labels[cpiCtr] == String(BM[i]['date']).substring(0, 4)) {
        averageCtr += 1;
        cpiCtr += 1;
        average += CPI_values[cpiCtr];
      }
      average = average / averageCtr;
      resList.push(Number(BM[i][decider] / average));
      if (i + 1 < BM.length) {
        if (String(BM[i]['date']).substring(0, 4) ==
            String(BM[i + 1]['date']).substring(0, 4)) {
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

 function getColour(val){
  if(val >= 0){
    return '#9BD0F5'
  }else{
    return'#FFB1C1'
  }
}

function initCurrencyValueChart(){
  return new Chart(CurrencyValueChart, {
  type: 'bar',
  data: {
      labels: resDates,
      datasets: [{
      label: 'CPI for chosen country',
      data: resValues,
      borderWidth: 1,
      backgroundColor: resValues.map(val => getColour(val))
      }]
  },
  options: {
    indexAxis: 'y',
      scales: {
      y: {
          beginAtZero: true
      }
      }
  }
  });
}

function updateCurrencyValueChart() {

  console.log("updating BMorCPIChart");
  initializeTheCurrencyComparison();
  currencyValueChart.data.labels = resDates
  currencyValueChart.data.datasets[0].data = resValues
  currencyValueChart.data.datasets[0].backgroundColor = resValues.map(val => getColour(val))
  currencyValueChart.update();

}


  function initIndividualChart() {
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
    return new Chart(expenseChart, {
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
    return new Chart(comparisonCahrt, {
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
    mapChart = new Chart(document.getElementById('canvas').getContext('2d'), {
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
