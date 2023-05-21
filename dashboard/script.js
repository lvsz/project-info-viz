document.addEventListener("DOMContentLoaded", function(event) {
  const ctx = document.getElementById('myChart');
  const comparisonCahrt = document.getElementById('CPItoBigMacComparisonChart');
  const expenseChart = document.getElementById('expenseChart');

  var chosenCountry = "None"

  var RAW_INDEX = undefined;

  d3.csv('http://files.ibuildpages.com/raw-index.csv').then(function(data) {
    RAW_INDEX = data;
    initDashboard(data);
  });

  function initDashboard(data) {

    initTimeSlider();

  }

  function initTimeSlider() {

    let dates = [...new Set(RAW_INDEX.map(row => row.date))];
    console.log(dates);

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



  new Chart(comparisonCahrt, {
  type: 'line',
  data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
      label: 'correlation between CPI and Big mac index',
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


  fetch(' https://cdn.jsdelivr.net/npm/world-atlas/countries-50m.json')
  .then((r) => r.json())
  .then((data) => {
    const countries = ChartGeo.topojson.feature(data, data.objects.countries).features;

    const chart = new Chart(document.getElementById('canvas').getContext('2d'), {
      type: 'choropleth',
      data: {
        labels: countries.map((d) => d.properties.name),
        datasets: [
          {
            label: 'Countries',
            data: countries.map((d) => ({
              feature: d,
              value: Math.random(),
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
          const res = chart.getElementsAtEventForMode(
            e,
            'nearest',
            { intersect: true },
            true
          );
          chosenCountry = chart.data.labels[res[0].index]
          console.log(chosenCountry);
          changeData(chart2);
        },
      },
    });
  });

});