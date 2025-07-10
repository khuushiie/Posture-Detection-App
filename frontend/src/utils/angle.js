export function calculateAngle(pointA, pointB, pointC) {
  if (!pointA || !pointB || !pointC) return 0;

  const vectorAB = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
  const vectorBC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };
  const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;
  const magnitudeAB = Math.sqrt(vectorAB.x ** 2 + vectorAB.y ** 2);
  const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2);
  const cosTheta = Math.min(1, Math.max(-1, dotProduct / (magnitudeAB * magnitudeBC)));
  return Math.acos(cosTheta) * (180 / Math.PI);
}
