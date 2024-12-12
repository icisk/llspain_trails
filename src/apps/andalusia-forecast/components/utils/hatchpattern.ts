// hatchPattern.ts
export function createHatchPattern(
    color: string = 'rgba(128, 128, 128, 0.5)',
    lineWidth: number = 1,
    size: number = 8
  ): CanvasPattern | null {
    // Erstellt ein Canvas-Element für das Muster
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
  
    if (!context) {
      console.error('2D context could not be created.');
      return null;
    }
  
    // Hintergrund transparent lassen
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
  
    // Zeichne diagonale Linien
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvas.width, canvas.height);
    context.stroke();
  
    return context.createPattern(canvas, 'repeat');
  }
  