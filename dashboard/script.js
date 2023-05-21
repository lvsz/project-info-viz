document.addEventListener("DOMContentLoaded", function(event) {
  const ctx = document.getElementById('myChart');
  const comparisonCahrt = document.getElementById('CPItoBigMacComparisonChart');
  const expenseChart = document.getElementById('expenseChart');

  var chosenCountry = "Euro area"
  var year = 2005
  var currency = 'EUR';
  var csv;
  var thisYearCsv;


  d3.csv('http://files.ibuildpages.com/raw-index.csv')
  .then(test);

  function test(data) {
    console.log(data)
    csv = data;
    thisYearCsv = csv.filter(function(entry) {
      return entry.date.substring(0, 4) == year;
      });
  }

  // console.log(csv)


  function newYear(chart){
    thisYearCsv = csv.filter(function(entry) {
      return entry.date.substring(0, 4) == year;
      });
      chart.update()
  }

  function lookupBM(country){
    // console.log(thisYearCsv)
    var answer = thisYearCsv.filter(function(entry) {
      return entry.name == country;
    })
    // console.log(answer[0])
    if(typeof answer[0] === 'undefined'){answer = 0}else{answer = Number(answer[0][currency])}
    return answer
    
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
              value: lookupBM(d.properties.name)//.then(result => res),//Math.random(),
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