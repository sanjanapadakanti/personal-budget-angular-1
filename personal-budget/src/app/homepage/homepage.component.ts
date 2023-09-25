import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import * as d3 from 'd3';
import { DataService } from '../data.service';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  private dataSource = {
    datasets: [
      {
        data: [] as any[],
        backgroundColor: [
          '#ffcd56',
          '#ff6384',
          '#36a2eb',
          '#fd6b19'
        ]
      }
    ],
    labels: [] as any[]
  };

  private data: any[] = [];

  constructor(private http: HttpClient, private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchDataAndCreateChart();
  }

  fetchDataAndCreateChart() {
    if (this.dataService.getData().length === 0) {
      this.dataService.fetchData().subscribe(
        (res: any) => {
          this.dataService.setData(res.myBudget);
          console.log("Data is:", this.dataService.getData());
          for (var i = 0; i < this.dataService.getData().length; i++) {
            this.dataSource.datasets[0].data[i] = this.dataService.getData()[i].budget;
            this.dataSource.labels[i] = this.dataService.getData()[i].title;
            this.data.push(this.dataService.getData()[i]);
          }
          console.log("Data is ", this.dataSource);
          this.createChart();
          this.createSvg();
          this.createColors();
          this.drawChart();
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
    } else {
      for (var i = 0; i < this.dataService.getData().length; i++) {
        this.dataSource.datasets[0].data[i] = this.dataService.getData()[i].budget;
        this.dataSource.labels[i] = this.dataService.getData()[i].title;
        this.data.push(this.dataService.getData()[i]);
      }
      this.createChart();
      this.createSvg();
      this.createColors();
      this.drawChart();
    }
  }

  private myPieChart: any;

  private createChart() {
    if (this.myPieChart) {
      this.myPieChart.destroy();
    }

    const chartCanvas = document.getElementById('myChart') as HTMLCanvasElement | null;

    if (chartCanvas) {
      const ctx = chartCanvas.getContext('2d');

      if (ctx) {
        this.myPieChart = new Chart(ctx, {
          type: 'pie',
          data: this.dataSource
        });
      } else {
        console.error("getContext('2d') returned null");
      }
    } else {
      console.error("Element with ID 'myChart' not found");
    }
  }

  private svg: any;
  private margin = 60;
  private width = 400;
  private height = 400;
  private outerRadius = Math.min(this.width, this.height) / 2 - this.margin;
  private innerRadius = this.outerRadius * 0.6;
  private labelOffset = 40;
  private colors: any;

  private customColors: any = [
    '#ff5733',
    '#ffc300',
    '#4caf50',
    '#2196f3'
  ];

  private createSvg(): void {
    this.svg = d3.select("#myD3Chart")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr(
        "transform",
        "translate(" + this.width / 2 + "," + this.height / 2 + ")"
      );
  }

  private createColors(): void {
    this.colors = d3.scaleOrdinal()
      .domain(this.data.map((d: any) => d.budget.toString()))
      .range(this.customColors);
  }

  private drawChart(): void {
    const pie = d3.pie<any>().value((d: any) => Number(d.budget));

    const arcGenerator = d3.arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius);

    const midRadius = (this.innerRadius + this.outerRadius) / 2;

    const labelLocation = d3.arc()
      .innerRadius(midRadius)
      .outerRadius(this.outerRadius + this.labelOffset);

    const arcs = this.svg
      .selectAll('pieces')
      .data(pie(this.data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arcGenerator)
      .attr('fill', (d: any, i: any) => this.colors(i))
      .attr("stroke", "#121926")
      .style("stroke-width", "1px");

    arcs.append('text')
      .text((d: any) => `${d.data.title} (${d.data.budget})`)
      .attr("transform", (d: any) => {
        const pos = labelLocation.centroid(d);
        return "translate(" + pos[0] + "," + pos[1] + ")";
      })
      .style("text-anchor", "middle")
      .style("font-size", 15);

    arcs.append('line')
      .attr("x1", (d: any) => {
        const pos = arcGenerator.centroid(d);
        const midAngle = Math.atan2(pos[1], pos[0]);
        return Math.cos(midAngle) * midRadius;
      })
      .attr("y1", (d: any) => {
        const pos = arcGenerator.centroid(d);
        const midAngle = Math.atan2(pos[1], pos[0]);
        return Math.sin(midAngle) * midRadius;
      })
      .attr("x2", (d: any) => {
        const pos = labelLocation.centroid(d);
        const midAngle = Math.atan2(pos[1], pos[0]);
        return Math.cos(midAngle) * (midRadius + this.labelOffset);
      })
      .attr("y2", (d: any) => {
        const pos = labelLocation.centroid(d);
        const midAngle = Math.atan2(pos[1], pos[0]);
        return Math.sin(midAngle) * (midRadius + this.labelOffset);
      })
      .attr("stroke", "#121926")
      .style("stroke-width", "2px");
  }
}
