document.addEventListener("DOMContentLoaded", function(event) {
  const ctx = document.getElementById('myChart');
  const comparisonCahrt = document.getElementById('CPItoBigMacComparisonChart');
  const expenseChart = document.getElementById('expenseChart');

  var chosenCountry = "EUZ"
  var chosenCPI = "EUR"
  var chosenDate;
  var chosenBaseCurrency = 'EUR';
  var RAW_INDEX;
  var CPI;
  var CPI_labels;
  var CPI_values;
  var correlationList;

  var mapChart;
  var correlationChart;

  var countries;
 
  
  Promise.all([
    d3.csv('http://files.ibuildpages.com/raw-index.csv'),
    d3.csv('https://raw.githubusercontent.com/lvsz/project-info-viz/node-server/data/rateinf/CPI_'+ chosenCPI+'.csv'),
    fetch('https://cdn.jsdelivr.net/npm/world-atlas/countries-50m.json')//placeholder
    .then((r) => r.json())
  ])
  .then(function(values) {

    // D3
    RAW_INDEX = values[0];

    // World Atlas
    countries = ChartGeo.topojson.feature(values[2], values[2].objects.countries).features;

    //cpi
    CPI = values[1]
    CPI_labels = getLabels(CPI, 'Date')
    CPI_values = getValues(CPI, 'Value')
    createCorrelationList()
    console.log(correlationList)

    initDashboard();

  });


  function initDashboard() {

    let dates = [...new Set(RAW_INDEX.map(row => row.date))];
    chosenDate = dates[0];

    initTimeSlider(dates);
    mapChart = initMap();
    correlationChart = initCorrelationChart();

  }

  function updateDashboard(){
    updateMap();
  }

 EuroAreaList = ['Austria', 'Belgium', 'Croatia','Republic of Cyprus', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Ireland',
  'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands','Portugal','Slovakia', 'Slovenia', 'Spain']

  function mapper(country){
    if(country == 'United States of America'){return'United States'}else if(EuroAreaList.includes(country)){return'Euro area'}else if(country == 'United Kingdom'){return 'Britain'}else{return country}
  }
 
  function lookupBM(country){
    // console.log(RAW_INDEX);
    const promptName = mapper(country)
    var answer = RAW_INDEX.filter(entry => entry.name == promptName && entry.date == chosenDate);
    // console.log(answer);
    if(typeof answer[0] === 'undefined'){answer = -1}else{answer = Number(answer[0]["dollar_price"])}
    return answer
  }

  function getLabels(Array2D, decider){
    var resList = []
    for (let i = 0; i < Array2D.length; i++) {
      resList.push(String(Array2D[i][decider]).substring(0, 4));
    }
    return resList
  }

  function getValues(Array2D, decider){
    var resList = []
    for (let i = 0; i < Array2D.length; i++) {
      resList.push(Number(Array2D[i][decider]));
    }
    return resList
  }

  function isExistingYear(dateBM){
    return CPI_labels.includes(String(dateBM).substring(0, 4))
  }

  function createCorrelationList(){
    var answer = RAW_INDEX.filter(entry => entry.iso_a3 == chosenCountry && isExistingYear(entry.date));
    if(typeof answer[0] === 'undefined'){answer = []}else{}
    correlationList = answer
  }

  function createCorrelationValuesList(BM, decider){
    var resList = []
    var cpiCtr = 0
    var average = 0
    var averageCtr = 0 
    for (let i = 0; i < BM.length; i++) {
      while(cpiCtr < CPI_labels.length && CPI_labels[cpiCtr] == String(BM[i]['date']).substring(0, 4)) {
        averageCtr += 1
        cpiCtr += 1
        average += CPI_values[cpiCtr]
      }
      if((cpiCtr < CPI_labels.length && CPI_labels[cpiCtr] == String(BM[i]['date']).substring(0, 4)) == false){
        console.log(CPI_labels[cpiCtr])
      }
      average = average / averageCtr
      resList.push(Number(BM[i][decider] / average))
      averageCtr = 0
      average = 0
    }
    return resList
  }



  function initTimeSlider(dates) {

    let options = { year: 'numeric', month: 'long' };
    let slides = dates.map(date => `<div class="swiper-slide" data-date="${date}">${new Date(date).toLocaleDateString("en-US", options)}</div>`);

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

    console.log("Current date: ", dates[0]);

    swiper.on('slideChange', function () {
      console.log("Current date: ", $(swiper.slides[swiper.activeIndex]).data("date"));
      chosenDate = $(swiper.slides[swiper.activeIndex]).data("date");
      updateDashboard();
    });

  }

  function changeData(chart) {
    console.log(chart.data.datasets[0].label)
    //change this to lookup the data for the given country and change the graph's labels and data
    // chart.data.labels =labels for the chosenCountry
    // chart.data.datasets[0]. data =labels for the chosenCountry
    chart.update();
}

  new Chart(ctx, {
  type: 'bar',
  data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      borderWidth: 1
      }]
  },
  options: {
      scales: {
      y: {
          beginAtZero: true
      }
      }
  }
  });

  const chart2 = new Chart(expenseChart, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
        label: 'the yearly expense of chosen country',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
        }]
    },
    options: {
        scales: {
        y: {
            beginAtZero: true
        }
        }
    }
    });


  function initCorrelationChart(){  
    return new Chart(comparisonCahrt, {
    type: 'line',
    data: {
        labels: getLabels(correlationList, 'date'),
        datasets: [{
        label: 'correlation between CPI and Big mac index',
        data: createCorrelationValuesList(correlationList, 'local_price'), //getValues(correlationList, 'local_price'),
        borderWidth: 1
        }]
    },
    options: {
        scales: {
        y: {
            beginAtZero: true
        }
        }
    }
    });
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
              value: lookupBM(d.properties.name)
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
        onClick: (e) =>{
          const res = mapChart.getElementsAtEventForMode(
            e,
            'nearest',
            { intersect: true },
            true
          );
          chosenCountry = mapChart.data.labels[res[0].index]
          console.log(chosenCountry);
          changeData(chart2);
        },
      },
    });

    return mapChart;

  }


  function updateMap() {

    console.log("updating map");
    console.log(mapChart.data.datasets.filter(e => e.label == 'Countries')[0].data);

    mapChart.data.datasets.filter(e => e.label == 'Countries')[0].data = countries.map((d) => ({
      feature: d,
      value: lookupBM(d.properties.name)
    }));

    mapChart.update();

  }



});