# TennisAnalytics Project Guide for LLMs

## Project Overview
This project focuses on creating interactive visualizations for tennis data analysis. The primary goal is to create engaging visual representations of tennis statistics and patterns.

## Project Structure
The project follows a visualization-centric organizational pattern:

### Main Folders and Their Purposes
- `viz/`: Primary visualization output folder
  - Contains standalone HTML visualizations
  - Naming pattern: [Tournament]_[Year].html for tournament-specific views
  - viz.css provides consistent styling across visualizations

- Player/Topic Specific Folders (e.g. `bigthree/`, `stantheman/`):
  - Standard structure for topic-focused visualizations:
    - index.html: Entry point and visualization container
    - data/: CSV files specific to the analysis
    - js/: Visualization scripts
    - Custom CSS for topic-specific styling

- `components/`: Reusable website components
  - header.html, footer.html: Common page elements
  - include.js: Handles component inclusion and path management

### Visualization Types and Patterns

1. Network Visualizations (see viz/tennis_network_200Match.html):
   - Player relationship networks
   - Interactive tooltips with match statistics
   - Color coding for performance metrics
   - Uses Pyvis for network generation

2. Statistical Visualizations (see stantheman/js/):
   - Timeline charts (gs_timeline_chart.js)
   - Distribution analysis (gs_age_distribution_chart.js)
   - Breakthrough analysis (gs_breakthrough_chart.js)
   - Built with D3.js for custom interactivity

3. Tournament Analysis (see viz/Grand_Slam_Finals_*.html):
   - Tournament-specific visualizations
   - Match outcome networks
   - Historical progression views

### Adding New Visualizations

1. For a New Topic/Player Analysis:
   ```
   new_analysis/
   ├── index.html          # Main visualization page
   ├── analysis.css        # Topic-specific styles
   ├── data/              # Topic data files
   │   └── statistics.csv
   └── js/               # Visualization scripts
       └── charts.js
   ```

2. For Tournament/Match Analysis:
   - Add visualization HTML directly to viz/ folder
   - Follow existing naming patterns
   - Use viz.css for styling

### Visualization Code Patterns

1. D3.js Charts:
   ```javascript
   function createChart() {
       // Set dimensions and margins
       const margin = {top: 20, right: 20, bottom: 30, left: 40};
       const width = 960 - margin.left - margin.right;
       const height = 500 - margin.top - margin.bottom;

       // Create SVG container
       const svg = d3.select("#chart")
           .append("svg")
           .attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);

       // Add visualization elements
       // Add interactivity
   }
   ```

2. Tooltip Pattern:
   ```javascript
   // Standard tooltip configuration
   const tooltip = d3.select("#shared-tooltip");
   
   element.on("mouseover", function(event, d) {
       tooltip.transition()
           .duration(200)
           .style("opacity", .9);
       tooltip.html(/* tooltip content */)
           .style("left", (event.pageX + 10) + "px")
           .style("top", (event.pageY - 28) + "px");
   });
   ```

### Styling Guidelines
- Primary color: #1e5631 (tennis court green)
- Chart container styling from viz.css:
  ```css
  .chart-container {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: var(--shadow-soft);
  }
  ```
- Fonts: Playfair Display (headings), Montserrat (body)
- Responsive design breakpoints in CSS

## Adding New Analysis
1. Create new folder following structure above
2. Copy existing visualization patterns from similar analyses
3. Ensure responsive design and consistent styling
4. Link from index.html if main navigation item

## Common Modifications
1. New Visualizations:
   - Create new JS files in appropriate js/ folder
   - Add HTML container in index.html
   - Apply standard styling patterns

2. Updating Visualizations:
   - Modify relevant JS files in visualization folder
   - Update HTML if changing layout/structure
   - Maintain consistent styling

3. Styling Updates:
   - Global changes in tennis_analytics.css
   - Topic-specific in local CSS files

## Dependencies
- D3.js for custom visualizations
- Pyvis for network visualizations
- Custom CSS for styling
- Font Awesome for icons

Note: Data processing and analysis code in the code/ folder is for reference only - new visualizations should work with pre-processed data provided in data/ folders.