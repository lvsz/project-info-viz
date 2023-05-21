document.addEventListener("DOMContentLoaded", function(event) {
        
    const ctx = document.getElementById('myChart');

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
        },
      });
    });

});