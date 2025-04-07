import { Style, Fill, Stroke } from 'ol/style';

function createVerticalStripePattern(): CanvasPattern {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#4c4cff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.lineTo(2, canvas.height);
  ctx.stroke();

  return ctx.createPattern(canvas, 'repeat')!;
}

function createCirclePattern(): CanvasPattern {
    const canvas = document.createElement('canvas');
    canvas.width = 12;
    canvas.height = 12;
  
    const ctx = canvas.getContext('2d')!;
    
    // Grauer Hintergrund
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Roter, nicht ausgefüllter Kreis
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(6, 6, 3, 0, 2 * Math.PI); // Kreis in der Mitte
    ctx.stroke();
  
    return ctx.createPattern(canvas, 'repeat')!;
  }
 

export function getGeologicalPolygonStyle(type: string): Style {
  let fillColor: string | CanvasPattern;

  switch (type) {
    case "00000000":
      fillColor = createCirclePattern();
      break;
    case "00020000":
      fillColor = "d9ffff";
      break;
    case "00040000":
      fillColor = "ffd9ff";
      break;
    case "00100000":
      fillColor = "b2b2ff";
      break;
    case "00290000":
      fillColor = "ff7f7f";
      break;
    case "00390000":
      fillColor = "#4cd9ff";
      break;
    case "00420000":
      fillColor = "#4c4cff";
      break;
    case "00424013":
      fillColor = createVerticalStripePattern();
      break;
    case "00500000":
      fillColor = "#ff4c4c";
      break;
    case "00510000":
      fillColor = "#ff7f4c";
      break;
    case "00930000":
      fillColor = "#b2d9d9";
      break;
    case "01060000":
      fillColor = "#d9b27f";
      break;
    case "02020000":
      fillColor = "#d900b2";
      break;
    case "02500000":
      fillColor = "#ffcc4c";
      break;
    case "05100000":
      fillColor = "#ced9d9";
      break;
    case "05280000":
      fillColor = "#ffffcc";
      break;
    case "05470000":
      fillColor = "#d0c7c7";
      break;
    default:
      fillColor = "gray";
      break;
  }

  return new Style({
    fill: new Fill({
      color: fillColor,
    }),
    stroke: new Stroke({
      color: '#333',
      width: 1,
    }),
  });
}


export function getGeologicalLineStyle(type: number): Style {
    let color: string;
    switch (type) {
        case 801901:
            color = "red";
            break;
        case 550101:
            color = "black";
            break;
        case 540101:
            color = "blue";
            break;
        default:
            color = "gray";
            break;
    }
    return new Style({
        stroke: new Stroke({
            color: color,
            width: 2,
        }),
    });
}