// tennis_trends.js - Stacked Area Chart for Tennis Top 100 Evolution

  const COUNTRY_COLORS = [
    "#1a9850", // green
    "#4575b4", // blue
    "#a04000", // deep brown-orange
    "#ba4a00", // burnt orange
    "#e4572e", // strong orange-red
    "#f27059", // deep coral
    "#f4845f", // coral orange
    "#f7b267", // warm sand
    "#f9d276" // light gold

  ];

function createTrendsChart() {
    // Clear any existing chart
    d3.select("#trends-chart svg").remove();

    // Set up dimensions
    const container = document.getElementById('trends-chart');
    const containerWidth = container.clientWidth;
    const margin = { top: 40, right: 150, bottom: 40, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select('#trends-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data for stacked area chart
    const stackedData = tennisData.map(yearData => {
        const processedData = {
            year: yearData.year
        };
        MAJOR_TENNIS_NATIONS.forEach(country => {
            processedData[country] = yearData.countries[country]?.ever_in_top100 || 0;
        });
        return processedData;
    });

    // Create scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(tennisData, d => d.year))
        .range([0, width]);

    // Create stack generator
    const stack = d3.stack()
        .keys(MAJOR_TENNIS_NATIONS)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const layers = stack(stackedData);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(layers, layer => d3.max(layer, d => d[1]))])
        .range([height, 0]);

    // Add subtle grid lines
    svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.1)
        .call(d3.axisBottom(xScale)
            .tickSize(-height)
            .tickFormat(''));

    // Create area generator with smooth curves
    const area = d3.area()
        .x(d => xScale(d.data.year))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveCatmullRom);

    // Add vertical line for current year with gradient
    const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'line-gradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', 0).attr('y2', height);

    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#666');
    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#666')
        .attr('stop-opacity', 0.2);

    const yearLine = svg.append('line')
        .attr('class', 'current-year-line')
        .attr('y1', 0)
        .attr('y2', height)
        .style('stroke', 'url(#line-gradient)')
        .style('stroke-width', 1.5);

    // Add areas with enhanced interactivity
    svg.selectAll('.layer')
        .data(layers)
        .enter()
        .append('path')
        .attr('class', 'layer')
        .attr('d', area)
        .style('fill', (d, i) => COUNTRY_COLORS[i])
        .style('opacity', 0.85)
        .on('mouseover', function(event, d) {
            // Dim other layers
            svg.selectAll('.layer')
                .style('opacity', 0.4);
            d3.select(this)
                .style('opacity', 1)
                .style('filter', 'brightness(1.1)');
            
            const mouseX = d3.pointer(event)[0];
            const year = Math.round(xScale.invert(mouseX));
            const yearData = stackedData.find(y => y.year === year);
            
            if (yearData) {
                const country = d.key;
                const value = yearData[country];

                // Add or update value label
                const y0 = d.find(p => p.data.year === year)?.[0] || 0;
                const y1 = d.find(p => p.data.year === year)?.[1] || 0;
                const yPosition = yScale((y0 + y1) / 2);

                // Remove any existing value label
                svg.selectAll('.value-label').remove();

                // Add new value label
                svg.append('text')
                    .attr('class', 'value-label')
                    .attr('x', xScale(year))
                    .attr('y', yPosition)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .style('fill', 'white')
                    .style('font-weight', '600')
                    .style('font-size', '12px')
                    .style('pointer-events', 'none')
                    .text(value);
                
                const tooltip = d3.select('.tooltip');
                tooltip.html(`
                    <div class="country-name">${country}</div>
                    <div class="stat-item">
                        <span class="stat-label">Year:</span>
                        <span class="stat-value">${year}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Players in Top 100:</span>
                        <span class="stat-value">${value}</span>
                    </div>
                `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .style('opacity', 1)
                .style('display', 'block');
            }
        })
        .on('mousemove', function(event, d) {
            const mouseX = d3.pointer(event)[0];
            const year = Math.round(xScale.invert(mouseX));
            const yearData = stackedData.find(y => y.year === year);
            
            if (yearData) {
                // Update value label position
                const y0 = d.find(p => p.data.year === year)?.[0] || 0;
                const y1 = d.find(p => p.data.year === year)?.[1] || 0;
                const yPosition = yScale((y0 + y1) / 2);

                svg.select('.value-label')
                    .attr('x', xScale(year))
                    .attr('y', yPosition);

                d3.select('.tooltip')
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            }
        })
        .on('mouseout', function() {
            svg.selectAll('.layer')
                .style('opacity', 0.85)
                .style('filter', 'none');
            
            // Remove value label
            svg.selectAll('.value-label').remove();
            
            d3.select('.tooltip')
                .style('opacity', 0)
                .style('display', 'none');
        });

    // Add axes with improved styling
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
            .tickFormat(d3.format('d'))
            .ticks(Math.min(width / 80, 10)));

    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale));

    // Add axis labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 35)
        .text('Year');

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .text('Players in Top 100');

    // Add legend with enhanced styling
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width + 20}, 0)`);

    const legendItems = legend.selectAll('g')
        .data(MAJOR_TENNIS_NATIONS)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('rx', 2)
        .style('fill', (d, i) => COUNTRY_COLORS[i]);

    legendItems.append('text')
        .attr('x', 25)
        .attr('y', 12)
        .text(d => d)
        .style('font-size', '12px');

    // Function to update year line position
    function updateYearLine() {
        yearLine
            .attr('x1', xScale(tennisData[currentYearIndex].year))
            .attr('x2', xScale(tennisData[currentYearIndex].year));
    }

    // Initial year line position
    updateYearLine();

    // Return the update function
    return updateYearLine;
}

// Add resize handler with debouncing
window.addEventListener('resize', debounce(() => {
    createTrendsChart();
}, 250));

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}