// Plotly.js Stacked Area Chart for Tennis Top 100 Evolution
// This replaces the D3 version and keeps all features, colors, and interactivity

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('trends-chart');
    if (!container) return;

    // Remove any existing Plotly chart
    container.querySelectorAll('div.plotly-graph-div').forEach(el => el.remove());

    const COUNTRY_COLORS = [
        "#1a9850", // Green
        "#87CEEB", // Sky blue
        "#FFCC00", // Bright Yellow
        "#FF9933", // Deep Apricot
        "#A3B18A", // Olive-Teal
        "#DDA15E", // Rich Camel
        "#9E2A2B", // Burgundy
        "#336699", // Denim Blue
        "#002147", // Midnight Blue
        "#C62F47",//Crimson
        "#800080"// (Purple)
      ];
    const MAJOR_TENNIS_NATIONS = ['USA', 'ESP', 'FRA', 'AUS', 'ITA', 'SWE', 'ARG', 'GER', 'RUS','SRB','SUI'];
    const COUNTRY_NAMES = {
      USA: "United States",
      ESP: "Spain",
      FRA: "France",
      AUS: "Australia",
      ITA: "Italy",
      SWE: "Sweden",
      ARG: "Argentina",
      GER: "Germany",
      RUS: "Russia",
      SRB: "Serbia",
      SUI: "Switerland"
    };

    fetch('data/top_tennis_players_timeline.json')
        .then(response => response.json())
        .then(tennisData => {
            // Prepare data for stacked area chart
            const years = tennisData.map(d => d.year);
            const countrySeries = MAJOR_TENNIS_NATIONS.map((country, i) => {
                return {
                    x: years,
                    y: tennisData.map(d => (d.countries[country]?.ever_in_top100 || 0)),
                    name: country,
                    stackgroup: 'one',
                    mode: 'lines+markers', // show both lines and markers
                    line: { color: COUNTRY_COLORS[i], width: 2 },
                    fillcolor: COUNTRY_COLORS[i],
                    marker: {
                        size: 8, // smaller dot
                        color: COUNTRY_COLORS[i],
                        line: { color: COUNTRY_COLORS[i], width: 0 } // no border
                    },
                    customdata: tennisData.map(d => [
                        d.countries[country]?.ever_in_top10 || 0,
                        d.countries[country]?.top_player || ''
                    ]),
                    hovertemplate: `%{x}<br>%{y} players from ${COUNTRY_NAMES[country]} in top 100 <br>%{customdata[0]} players in Top 10<br>Top player: %{customdata[1]}<extra></extra>`,
                    showlegend: true
                };
            });

            const layout = {
                autosize: true,
                width: null,
                margin: { t: 40, r: 20, b: 50, l: 60 },
                height: 400,
                plot_bgcolor: 'white',
                paper_bgcolor: 'white',
                title: '',
                xaxis: {
                    title: 'Year',
                    tickmode: 'linear',
                    dtick: 5,
                    showgrid: true,
                    gridcolor: '#eee',
                    zeroline: false,
                },
                yaxis: {
                    title: 'Players in Top 100',
                    showgrid: true,
                    gridcolor: '#eee',
                    zeroline: false,
                },
                legend: {
                    orientation: 'h',
                    x: 0.5,
                    y: 1.12,
                    xanchor: 'center',
                    yanchor: 'top',
                    font: { size: 13 }
                },
                hovermode: 'closest',
                font: {
                    family: 'Montserrat, sans-serif',
                    size: 13,
                    color: '#333'
                }
            };

            Plotly.newPlot(container, countrySeries, layout, {responsive: true, displayModeBar: false});
        });
});