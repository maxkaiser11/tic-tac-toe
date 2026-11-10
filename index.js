const GameBoard = (function () {
  const board = Array(9).fill("");

  const getBoard = () => [...board];

  const placeMark = (index, mark) => {
    if (index < 0 || index > 8 || board[index] !== "") return false;
    board[index] = mark;
    return true;
  };

  const reset = () => board.fill("");

  return { getBoard, placeMark, reset };
})();

const createPlayer = (name, mark) => ({ name, mark });

const player1 = createPlayer("player1", "X");
const player2 = createPlayer("player2", "O");

const GameController = (function () {
  const players = [
    createPlayer("Player 1", "X"),
    createPlayer("Player 2", "O"),
  ];
  let currentIndex = 0;
  let gameOver = false;

  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const getCurrentPlayer = () => players[currentIndex];

  const switchTurn = () => {
    currentIndex = currentIndex === 0 ? 1 : 0;
  };

  const checkWinnter = () => {
    const b = GameBoard.getBoard();
    return lines.some(([a, c, d]) => b[a] && b[a] === b[c] && b[a] === b[d]);
  };

  const checkTie = () => GameBoard.getBoard().every((cell) => cell !== "");

  const playRound = (index) => {
    if (gameOver) return { status: "over" };

    const player = getCurrentPlayer();
    if (!GameBoard.placeMark(index, player.mark)) {
      return { status: "invalid" };
    }

    if (checkWinnter()) {
      gameOver = true;
      return { status: "win", player };
    }
    if (checkTie()) {
      gameOver = true;
      return { status: "tie" };
    }

    switchTurn();
    return { status: "continue", next: getCurrentPlayer() };
  };

  const setPlayerNames = (name1, name2) => {
    players[0].name = name1 || "Player 1";
    players[1].name = name2 || "Player 2";
  };

  const restart = () => {
    GameBoard.reset();
    currentIndex = 0;
    gameOver = false;
  };

  return { playRound, getCurrentPlayer, setPlayerNames, restart };
})();
console.log(GameController.playRound(0)); // { status: "continue", next: {...O} }
console.log(GameController.playRound(3));
console.log(GameController.playRound(1));
console.log(GameController.playRound(4));
console.log(GameController.playRound(2)); // { status: "win", player: {...X} } // X → { status: "win", player: { name: "Player 1", mark: "X" } }

const DisplayController = (function () {
  const boardEl = document.querySelector("#board");
  const statusEl = document.querySelector("#status");
  const restartBtn = document.querySelector("#restart");
  const namesForm = document.querySelector("#names");

  let gameOver = false;

  const render = () => {
    boardEl.textContent = ""; // clear old cells
    GameBoard.getBoard().forEach((mark, index) => {
      const cell = document.createElement("button");
      cell.classList.add("cell");
      cell.dataset.index = index; // remember which cell this is
      cell.textContent = mark;
      cell.disabled = mark !== "" || gameOver;
      boardEl.appendChild(cell);
    });
  };

  const setStatus = (text) => (statusEl.textContent = text);

  const handleCellClick = (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return; // clicked a gap, not a cell

    const result = GameController.playRound(Number(index));

    if (result.status === "win") {
      gameOver = true;
      setStatus(`${result.player.name} wins!`);
    } else if (result.status === "tie") {
      gameOver = true;
      setStatus("It's a tie!");
    } else if (result.status === "continue") {
      setStatus(`${result.next.name}'s turn (${result.next.mark})`);
    }

    render();
  };

  const startNewGame = () => {
    GameController.restart();
    gameOver = false;
    const p = GameController.getCurrentPlayer();
    setStatus(`${p.name}'s turn (${p.mark})`);
    render();
  };

  boardEl.addEventListener("click", handleCellClick);
  restartBtn.addEventListener("click", startNewGame);
  namesForm.addEventListener("submit", (e) => {
    e.preventDefault(); // stop the page reloading
    GameController.setPlayerNames(
      document.querySelector("#p1").value,
      document.querySelector("#p2").value,
    );
    startNewGame();
  });

  startNewGame(); // draw the empty board on load
})();
