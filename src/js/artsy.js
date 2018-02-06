import * as d3 from "d3";
import "../css/artsy.css";

function setupPiece(selection) {
  selection
    .classed("piece", true)
    .style("width", pieceSize[0] + "px")
    .style("height", pieceSize[1] + "px")
    .style("background-image", `url(${src})`)
    .style("background-position", d => {
      return `-${(d.index % puzzlePieces[0]) * pieceSize[0]}px 
					 -${Math.floor(d.index / puzzlePieces[0]) * pieceSize[1]}px`;
    })
    .style("background-size", d => `${dim[0]}px ${dim[1]}px`);
}

function dragstarted() {
  d3
    .select(this)
    .raise()
    .style("border", "0px");
}

function dragged(d) {
  const stepX = pieceSize[0],
    stepY = pieceSize[1];

  d.x = Math.round(d3.event.x / stepX) * stepX + positionDiff[0];
  d.y = Math.round(d3.event.y / stepY) * stepY + positionDiff[1];
  const trans = translate(d);
  d3.select(this).style("transform", trans);
}

function dragend() {
  console.log(this.getBoundingClientRect(), hintPos, pieceSize);
  const dropRect = this.getBoundingClientRect();
  const dropPos = [
    Math.round(dropRect.y / pieceSize[1]),
    Math.round(dropRect.x / pieceSize[0]) - 2
  ]
  const el = d3.select(this)
  const elData = el.data()[0]
  const correctPos = elData.pos
  const correct = correctPos[0] === dropPos[0] && correctPos[1] === dropPos[1]
  pieceInfo[elData.index].correct = true

  if(isSolved()) {
    d3.select('.artwork-images').style('height', '65vh')
    alert('solved')
  }
  //debugger;
  d3
    .select(this)
    .raise()
    	.style('border', '0px')
      //.attr('data-correct', correct)
      //.attr('data-droppedpos', `${dropPos}`)
}

function translate(d) {
  return `translate(${d.x}px, ${d.y}px)`;
}

function isSolved() {
  return pieceInfo.every(d => d.correct || d.hint)
}

function makePuzzle() {
  d3.select('.artwork-images').style('height', '100vh') //make room for extra pieces

  imageContainer.selectAll("*").remove();


  const hintContainer = imageContainer
    .selectAll(".hints")
    .data([1])
    .enter()
    .append("div")
    .classed("hints", true)
    .style("width", `${dim[0]}px`)
    .style("height", `${dim[1]}px`);

  const extraPieceContainer = imageContainer
    .selectAll(".extra")
    .data([1])
    .enter()
    .append("div")
    .classed("extra", true);

  console.log(hintContainer.node().getBoundingClientRect());
  console.log(extraPieceContainer.node().getBoundingClientRect());

  hintPos = hintContainer.node().getBoundingClientRect();
  extraPos = extraPieceContainer.node().getBoundingClientRect();
  positionDiff = [
    (hintPos.x - extraPos.x) % pieceSize[0],
    (hintPos.y - extraPos.y) % pieceSize[1]
  ];

  const hintPieces = hintContainer
    .selectAll(".hint-piece")
    .data(pieceInfo.filter(d => d.hint))
    .enter()
    .append("div")
      .classed("hint-piece", true)
      .style("position", "absolute")
      .style("left", d => (d.index % puzzlePieces[0]) * pieceSize[0] + "px")
      .style(
        "top",
        d => Math.floor(d.index / puzzlePieces[0]) * pieceSize[1] + "px"
      )
      .call(setupPiece);

  const drag = d3
    .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragend);

  const hintsPerRow = 8
  const extraPieces = extraPieceContainer
    .selectAll(".extra")
    .data(d3.shuffle(pieceInfo.filter(d => !d.hint)))
    .enter()
    .append("div")
      .classed("extra-piece", true)
      .style("display", "inline-block")
      .call(setupPiece)
      .style("transform", (d, i) => {
        return `translate(${(i % hintsPerRow) * pieceSize[0]}px, ${Math.floor(i / hintsPerRow) *
          pieceSize[1]}px`;
      })
      .call(drag);
}

const imageContainer = d3.select(".artwork-images__images");
const img = imageContainer.select(
  ".artwork-images__images__image__display__img[src]"
);
const src = img.attr("src")
const dim = [img.node().clientWidth, img.node().clientHeight];

const newImage = new Image();
let streach, positionDiff, hintPos, extraPos;
newImage.src = src;
newImage.onload = () => {
  const actualSize = [this.width, this.height];
  streach = actualSize.map((d, i) => dim[i] / d * 100);
};

const puzzlePieces = [5, 4];
const pieceCount = puzzlePieces[0] * puzzlePieces[1];
const hintRatio = 0.4;
const pieceSize = [dim[0] / puzzlePieces[0], dim[1] / puzzlePieces[1]];

const pieceInfo = d3.range(pieceCount).map((d, i) => {
  return {
    index: i,
    hint: Math.random() < hintRatio,
    pos: [Math.floor(i / puzzlePieces[0]), i % puzzlePieces[0]]
  }
})

console.log(pieceInfo)


d3
  .select("body")
  .append("button")
    .text("make puzzle")
    .classed("puzzle-btn", true)
    .on("click", () => makePuzzle());
