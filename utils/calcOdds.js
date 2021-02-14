const calcOdds = (
  autonomy,
  departure,
  arrival,
  edges,
  countdown,
  bountyHuntersOccurances
) => {
  const INF = 1000000000;
  const SIZE = 500;

  let totalNodes = 0;

  let map = {};
  if(!map[departure]) map[departure] = ++totalNodes;
  if(!map[arrival]) map[arrival] = ++totalNodes;

// Adjacency matrix and visited Init
  let visited = new Array(SIZE+2).fill(0).map(() => new Array(SIZE+2).fill(0).map(() => new Array(SIZE+2).fill(0)));
  let adjacent = new Array(SIZE+2).fill(INF).map(() => new Array(SIZE+2).fill(INF));

  edges.forEach(edge => {
    if(!map[edge.origin]) map[edge.origin] = ++totalNodes;
    if(!map[edge.destination]) map[edge.destination] = ++totalNodes;

    adjacent[map[edge.origin]][map[edge.destination]] = edge.travelTime;
    adjacent[map[edge.destination]][map[edge.origin]] = edge.travelTime;
  });

  let bountyHunters = new Array(SIZE+2).fill(0).map(() => new Array(SIZE+2).fill(0));
  bountyHuntersOccurances.forEach(occurance => {
    if(!map[occurance.planet]) map[occurance.planet] = ++totalNodes;

    // bountyHunters[i][j] Number of bounty hunters in node i at the day j
    bountyHunters[map[occurance.planet]][occurance.day]++;
  })

// notBeingCaptured[i] Probability of not being captured with i bounty hunters in the node
  let notBeingCaptured = [];
  notBeingCaptured[0] = 1;
  for(let i=1; i<=SIZE; i++)
    notBeingCaptured[i] = notBeingCaptured[i-1] * 0.9;

  let success = new Array(SIZE+2).fill(0).map(() => new Array(SIZE+2).fill(0).map(() => new Array(SIZE+2).fill(0)));

  const calcSuccess = (currentNode, remainingAutonomy, pastDays) => {
    // More days spent than countdown
    if(pastDays > countdown) return 0;

    // Reached the destination
    if(currentNode === map[arrival]) return 1;

    // Reached already visited state, return the success
    if(visited[currentNode][remainingAutonomy][pastDays] !== 0)
      return success[currentNode][remainingAutonomy][pastDays];

    visited[currentNode][remainingAutonomy][pastDays] = 1;
    let result = notBeingCaptured[bountyHunters[currentNode][pastDays]] * calcSuccess(currentNode, autonomy, pastDays+1);
    for(let i=1; i<=totalNodes; i++){
      if(adjacent[currentNode][i] === INF || adjacent[currentNode][i] > remainingAutonomy) continue;
      result = Math.max(
        result,
        notBeingCaptured[bountyHunters[currentNode][pastDays]] * calcSuccess(i, remainingAutonomy - adjacent[currentNode][i], pastDays + adjacent[currentNode][i])
      );
    }

    // return success of current state
    success[currentNode][remainingAutonomy][pastDays] = result;
    return success[currentNode][remainingAutonomy][pastDays];
  }

  return calcSuccess(map[departure], autonomy, 0) * 100;
}

module.exports = calcOdds;
