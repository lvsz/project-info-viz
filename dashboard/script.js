document.addEventListener('DOMContentLoaded', function(event) {
  const ctx = document.getElementById('myChart');
  const comparisonChart = document.getElementById('CPItoBigMacComparisonChart');
  const expenseChart = document.getElementById('expenseChart');
  const macData = './';
  //'https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/output-data/';
  const macRawCSV = macData + 'mac-raw.csv';  //'big-mac-raw-index.csv';
  const macAdjCSV = macData + 'mac-adj.csv';  //'big-mac-adjusted-index.csv';

  var chosenCountry = 'EUZ'
  var chosenDate;
  var chosenBaseCurrency = 'EUR';
  var RAW_INDEX;

  var mapChart;

  var countries;


  Promise
      .all([
        // d3.csv('http://files.ibuildpages.com/raw-index.csv'),
        d3.csv(macRawCSV),
        fetch('https://cdn.jsdelivr.net/npm/world-atlas/countries-50m.json')
            .then((r) => r.json())
      ])
      .then(function(values) {
        // D3
        RAW_INDEX = values[0];

        // World Atlas
        countries =
            ChartGeo.topojson.feature(values[1], values[1].objects.countries)
                .features;

        initDashboard();
      });

  function initDashboard() {
    let dates = [...new Set(RAW_INDEX.map(row => row.date))];
    chosenDate = dates[0];

    initTimeSlider(dates);
    mapChart = initMap();
  }

  function updateDashboard() {
    updateMap();
  }

  function lookupBM(country) {
    // console.log(RAW_INDEX);
    var answer = RAW_INDEX.filter(
        entry => entry.name == country && entry.date == chosenDate);
    // console.log(answer);
    if (typeof answer[0] === 'undefined') {
      answer = 0
    } else {
      answer = Number(answer[0]['dollar_price'])
    }
    return answer
  }


  function initTimeSlider(dates) {
    let options = {year: 'numeric', month: 'long'};
    let slides = dates.map(
        date => `<div class="swiper-slide" data-date="${date}">${
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

    console.log('Current date: ', dates[0]);

    swiper.on('slideChange', function() {
      console.log(
          'Current date: ', $(swiper.slides[swiper.activeIndex]).data('date'));
      chosenDate = $(swiper.slides[swiper.activeIndex]).data('date');
      updateDashboard();
    });
  }

  function changeData(chart) {
    console.log(chart.data.datasets[0].label)
    // change this to lookup the data for the given country and change the
    // graph's labels and data
    //  chart.data.labels =labels for the chosenCountry
    //  chart.data.datasets[0]. data =labels for the chosenCountry
    chart.update();
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets:
          [{label: '# of Votes', data: [12, 19, 3, 5, 2, 3], borderWidth: 1}]
    },
    options: {scales: {y: {beginAtZero: true}}}
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
    options: {scales: {y: {beginAtZero: true}}}
  });



  new Chart(comparisonChart, {
    type: 'line',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: 'correlation between CPI and Big mac index',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {scales: {y: {beginAtZero: true}}}
  });

  function initMap() {
    mapChart = new Chart(document.getElementById('canvas').getContext('2d'), {
      type: 'choropleth',
      data: {
        labels: countries.map((d) => d.properties.name),
        datasets: [
          {
            label: 'Countries',
            data: countries.map(
                (d) => ({feature: d, value: lookupBM(d.properties.name)})),
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
          chosenCountry = mapChart.data.labels[res[0].index]
          console.log(chosenCountry);
          changeData(chart2);
        },
      },
    });

    return mapChart;
  }


  function updateMap() {
    console.log('updating map');
    console.log(
        mapChart.data.datasets.filter(e => e.label == 'Countries')[0].data);

    mapChart.data.datasets.filter(e => e.label == 'Countries')[0].data =
        countries.map(
            (d) => ({feature: d, value: lookupBM(d.properties.name)}));

    mapChart.update();
  }
});