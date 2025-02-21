const API_URL = 'https://rithm-jeopardy.herokuapp.com/api/';
const NUMBER_OF_CATEGORIES = 6;
const NUMBER_OF_CLUES_PER_CATEGORY = 5;

let categories = [];
let activeClue = null;
let activeClueMode = 0;
let isPlayButtonClickable = true;

const $playButton = $('#play');
const $categoriesTable = $('#categories');
const $activeClue = $('#active-clue');

$playButton.on('click', handleClickOfPlay);
$categoriesTable.on('click', '.clue', handleClickOfClue);
$activeClue.on('click', handleClickOfActiveClue);

function handleClickOfPlay() {
  if (isPlayButtonClickable) {
    isPlayButtonClickable = false;
    $playButton.text('Restart Game');
    $categoriesTable.empty();
    $activeClue.empty();

    setupTheGame();
  }
}

async function setupTheGame() {
  try {
    const categoryIds = await getCategoryIds();
    categories = await Promise.all(categoryIds.map(getCategoryData));

    fillTable(categories);
  } catch (error) {
    console.error('Error setting up game:', error);
    alert('Error setting up game. Please try again.');
  }
}

async function getCategoryIds() {
  try {
    const response = await axios.get(`${API_URL}/categories?count=100`);
    const allCategories = response.data;

    const filteredCategories = allCategories.filter(category => category.clues_count >= NUMBER_OF_CLUES_PER_CATEGORY);
    const randomCategoryIds = shuffleArray(filteredCategories.map(category => category.id)).slice(0, NUMBER_OF_CATEGORIES);

    return randomCategoryIds;
  } catch (error) {
    console.error('Error fetching category IDs:', error);
    throw error;
  }
}

async function getCategoryData(categoryId) {
  try {
    const response = await axios.get(`<span class="math-inline">\{API\_URL\}/category?id\=</span>{categoryId}`);
    const categoryData = response.data;

    const filteredClues = categoryData.clues.slice(0, NUMBER_OF_CLUES_PER_CATEGORY);
    return {
      id: categoryData.id,
      title: categoryData.title,
      clues: filteredClues
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    throw error;
  }
}

function fillTable(categories) {
  categories.forEach(category => {
    const categoryRow = $('<tr></tr>');
    const categoryTitleCell = $('<th></th>').text(category.title);
    categoryRow.append(categoryTitleCell);

    category.clues.forEach(clue => {
      const clueCell = $('<td></td>').addClass('clue').attr('data-clue-id', clue.id).text(clue.value);
      categoryRow.append(clueCell);
    });

    $categoriesTable.append(categoryRow);
  });
}

function handleClickOfClue(event) {
  const $clue = $(event.target);
  const clueId = $clue.data('clue-id');

  const selectedClue = categories.flatMap(category => category.clues).find(clue => clue.id === clueId);

  if (selectedClue) {
    activeClue = selectedClue;
    activeClueMode = 1;
    $activeClue.text(activeClue.question);
    $clue.addClass('used'); // Mark the clue as used
  }
}

function handleClickOfActiveClue() {
  if (activeClueMode === 1) {
    $activeClue.text(activeClue.answer);
    activeClueMode = 2;
  } else if (activeClueMode === 2) {
    $activeClue.empty();
    activeClue = null;
    activeClueMode = 0;

    if (categories.every(category => category.clues.length === 0)) {
      isPlayButtonClickable = true;
      $playButton.text('Restart Game');
      $activeClue.text('Game Over!');
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const