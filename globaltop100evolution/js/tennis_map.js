// tennis_map.js - Complete Tennis Top 100/10 Animation

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Global state
const MAJOR_TENNIS_NATIONS = ['USA', 'ESP', 'FRA', 'AUS', 'ITA', 'SWE', 'ARG', 'GER', 'RUS'];
let currentYearIndex = 0;
let isPlaying = false;
let playInterval;
let tennisData;
let countries; // Add countries to global state
const transitionDuration = 600;
const playbackInterval = 1500;
let countryCodeMapping;
let updateTrendsYearLine; // Function to update year line in trends chart

// Color scales
const colorScale = d3.scaleSequential(d3.interpolateYlGn)
    .domain([0, 50]); // Will adjust based on data

// Load data and create visualization
Promise.all([
    d3.json('https://unpkg.com/world-atlas@2.0.2/countries-110m.json'),
    d3.json('data/top_tennis_players_timeline.json'),
    d3.json('data/country_code_mapping.json')
]).then(([worldData, tennisData_, mapping]) => {
    tennisData = tennisData_;
    countryCodeMapping = mapping;
    
    // Process data
    const years = tennisData.map(d => d.year);
    countries = topojson.feature(worldData, worldData.objects.countries); // Store in global variable
    
    // Setup map
    setupMap(countries);
    
    // Initialize visualization
    updateVisualization(tennisData[currentYearIndex]);
    
    // Setup controls
    setupControls(tennisData);
    
    // Setup keyboard controls
    setupKeyboardControls();

    // Initialize trends chart
    updateTrendsYearLine = createTrendsChart();
}).catch(error => console.error('Error loading data:', error));

function setupMap(countries) {
    const width = document.getElementById('world-map').clientWidth;
    const height = document.getElementById('world-map').clientHeight;
    
    // Setup projection
    const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], {type: "FeatureCollection", features: countries.features});
    
    const path = d3.geoPath().projection(projection);
    
    // Create SVG
    const svg = d3.select('#world-map')
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    // Add countries
    svg.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', path)
        .attr('id', d => `country-${d.id}`)
        .on('mousemove', showTooltip)
        .on('mouseout', hideTooltip);

    // Add country labels
    const labelGroup = svg.append('g')
        .attr('class', 'country-labels');

    const labelPositions = countries.features
        .filter(f => {
            const tennisCode = countryCodeMapping.topojson_to_tennis[f.id];
            return MAJOR_TENNIS_NATIONS.includes(tennisCode);
        })
        .map(f => ({
            id: f.id,
            country: countryCodeMapping.topojson_to_tennis[f.id],
            position: projection(d3.geoCentroid(f))
        }));

    // Add label containers
    const labels = labelGroup.selectAll('.country-label')
        .data(labelPositions)
        .enter()
        .append('g')
        .attr('class', 'country-label')
        .attr('transform', d => `translate(${d.position[0]}, ${d.position[1]})`);

    // Add country code with white outline
    labels.append('text')
        .attr('class', 'label-country')
        .attr('y', -2)
        .attr('text-anchor', 'middle')
        .style('paint-order', 'stroke')
        .style('stroke', 'white')
        .style('stroke-width', '2px')
        .style('stroke-linecap', 'butt')
        .style('stroke-linejoin', 'miter')
        .text(d => d.country);

    // Add player count with white outline
    labels.append('text')
        .attr('class', 'label-count')
        .attr('y', 12)
        .attr('text-anchor', 'middle')
        .style('paint-order', 'stroke')
        .style('stroke', 'white')
        .style('stroke-width', '2px')
        .text('0');

    // Store labelPositions for updates
    svg.node().__labelPositions = labelPositions;

    // Add legend
    const legendWidth = 200;
    const legendHeight = 60;
    
    const legend = d3.select('#legend')
        .append('svg')
        .attr('width', legendWidth)
        .attr('height', legendHeight);
    
    const gradientId = 'legend-gradient';
    
    // Create gradient
    const gradient = legend.append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');
    
    // Add gradient stops
    const stops = [0, 0.2, 0.4, 0.6, 0.8, 1];
    stops.forEach(stop => {
        gradient.append('stop')
            .attr('offset', `${stop * 100}%`)
            .attr('stop-color', colorScale(stop * 50));
    });
    
    // Add gradient rect
    legend.append('rect')
        .attr('x', 10)
        .attr('y', 10)
        .attr('width', legendWidth - 20)
        .attr('height', 15)
        .style('fill', `url(#${gradientId})`);
    
    // Add axis
    const legendScale = d3.scaleLinear()
        .domain([0, 50])
        .range([10, legendWidth - 10]);
    
    const legendAxis = d3.axisBottom(legendScale)
        .tickValues([0, 10, 20, 30, 40, 50])
        .tickFormat(d => d);
    
    legend.append('g')
        .attr('transform', `translate(0, 25)`)
        .call(legendAxis);
    
    // Add label
    legend.append('text')
        .attr('x', legendWidth / 2)
        .attr('y', 55)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .text('Number of Players in Top 100');
}

function updateVisualization(yearData) {
    // Update map colors
    d3.selectAll('.country')
        .transition()
        .duration(transitionDuration)
        .style('fill', d => {
            const tennisCode = countryCodeMapping.topojson_to_tennis[d.id];
            const countryData = yearData.countries[tennisCode];
            return countryData ? colorScale(countryData.ever_in_top100) : '#e0e0e0';
        });
    
    // Update year label
    d3.select('#year-label').text(yearData.year);
    
    // Update slider
    document.getElementById('year-slider').value = currentYearIndex;

    // Update country labels
    updateCountryLabels(yearData);

    // Update trends chart year line
    if (updateTrendsYearLine) {
        updateTrendsYearLine();
    }
}

function updateCountryLabels(yearData) {
    d3.selectAll('.label-count')
        .transition()
        .duration(transitionDuration)
        .text(function(d) {
            const countryData = yearData.countries[d.country];
            return countryData ? countryData.ever_in_top100 : '0';
        });
}

// Control setup functions
function setupControls(tennisData) {
    // Play/Pause button
    const playButton = document.getElementById('play-pause');
    playButton.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playButton.textContent = isPlaying ? 'Pause' : 'Play';
        
        if (isPlaying) {
            playInterval = setInterval(() => {
                if (currentYearIndex < tennisData.length - 1) {
                    currentYearIndex++;
                    updateVisualization(tennisData[currentYearIndex]);
                } else {
                    isPlaying = false;
                    playButton.textContent = 'Play';
                    clearInterval(playInterval);
                }
            }, playbackInterval);
        } else {
            clearInterval(playInterval);
        }
    });
    
    // Year slider
    const slider = document.getElementById('year-slider');
    slider.max = tennisData.length - 1;
    
    slider.addEventListener('input', () => {
        currentYearIndex = parseInt(slider.value);
        updateVisualization(tennisData[currentYearIndex]);
        
        // Stop playback if sliding manually
        if (isPlaying) {
            isPlaying = false;
            playButton.textContent = 'Play';
            clearInterval(playInterval);
        }
    });
}

function setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'Space':
                document.getElementById('play-pause').click();
                event.preventDefault();
                break;
            case 'ArrowLeft':
                if (currentYearIndex > 0) {
                    currentYearIndex--;
                    updateVisualization(tennisData[currentYearIndex]);
                }
                event.preventDefault();
                break;
            case 'ArrowRight':
                if (currentYearIndex < tennisData.length - 1) {
                    currentYearIndex++;
                    updateVisualization(tennisData[currentYearIndex]);
                }
                event.preventDefault();
                break;
        }
    });
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    if (!countries) return; // Guard against resize before data loads

    const width = document.getElementById('world-map').clientWidth;
    const height = document.getElementById('world-map').clientHeight;
    
    const svg = d3.select('#world-map');
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    
    // Update projection
    const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], {type: "FeatureCollection", features: countries.features});
    
    const path = d3.geoPath().projection(projection);
    
    // Update country paths
    svg.selectAll('path')
        .attr('d', path);

    // Update label positions
    const labelPositions = countries.features
        .filter(f => {
            const tennisCode = countryCodeMapping.topojson_to_tennis[f.id];
            return MAJOR_TENNIS_NATIONS.includes(tennisCode);
        })
        .map(f => ({
            id: f.id,
            country: countryCodeMapping.topojson_to_tennis[f.id],
            position: projection(d3.geoCentroid(f))
        }));

    svg.selectAll('.country-label')
        .data(labelPositions)
        .transition()
        .duration(transitionDuration)
        .attr('transform', d => `translate(${d.position[0]}, ${d.position[1]})`);

    // Store updated positions
    svg.node().__labelPositions = labelPositions;

    // Update trends chart
    if (updateTrendsYearLine) {
        createTrendsChart();
    }
}, 250));

function showTooltip(event, d) {
    const tennisCode = countryCodeMapping.topojson_to_tennis[d.id];
    const countryData = tennisData[currentYearIndex].countries[tennisCode];
    if (!countryData) return;

    const tooltip = d3.select('.tooltip');
    if (tooltip.empty()) {
        d3.select('body').append('div').attr('class', 'tooltip');
    }

    const content = `
        <div class="country-name">${d.properties.name}</div>
        <div class="stat-item">
            <span class="stat-label">Players in Top 100:</span>
            <span class="stat-value">${countryData.ever_in_top100}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Players in Top 10:</span>
            <span class="stat-value">${countryData.ever_in_top10}</span>
        </div>
        ${countryData.top_player ? `
        <div class="stat-item">
            <span class="stat-label">Top Player:</span>
            <span class="stat-value">${countryData.top_player}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Highest Ranking:</span>
            <span class="stat-value">#${countryData.top_rank}</span>
        </div>
        ` : ''}
    `;

    d3.select('.tooltip')
        .html(content)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY + 10) + 'px')
        .style('opacity', 1)
        .style('display', 'block');
}

function hideTooltip() {
    d3.select('.tooltip')
        .style('opacity', 0)
        .style('display', 'none');
}