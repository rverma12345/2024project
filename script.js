const apiKey = 'AIzaSyBuk_AmRSgWnPHIc79Gj-5eTcfJdLE4x8w'; // Your API key
const sheetId = '1cLuRfqVkfmq-GwzFXwq07zxyMraJsZx88djOGBX-Z8k'; // Your Google Sheets ID
const range = 'Sheet1!A:F'; // Adjust the range as needed

let collegesData = []; // Array to store fetched data

async function fetchSheetData() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`);
        const data = await response.json();

        if (data.values && data.values.length > 0) {
            return data.values;
        } else {
            console.error('No values found in the sheet.');
            return [];
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function showSuggestions(colleges) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions
    if (colleges.length > 0) {
        suggestionsContainer.style.display = 'block';
        colleges.forEach(([college]) => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item');
            item.textContent = college;
            item.onclick = () => selectCollege(college); // Add click event to select college
            suggestionsContainer.appendChild(item);
        });
    } else {
        suggestionsContainer.style.display = 'none'; // Hide if no suggestions
    }
}

function selectCollege(college) {
    const searchInput = document.getElementById('college-search');
    searchInput.value = college; // Set input value to the selected college
    document.getElementById('suggestions').style.display = 'none'; // Hide suggestions
}

// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
}

const onInputChange = () => {
    const searchTerm = document.getElementById('college-search').value.toLowerCase();
    const filteredColleges = collegesData.filter(([college]) => college.toLowerCase().includes(searchTerm));
    showSuggestions(filteredColleges); // Show matching colleges
};

// Use debounce to limit the frequency of input events
document.getElementById('college-search').addEventListener('input', debounce(onInputChange, 300)); // 300ms delay

// Fetch and populate colleges
fetchSheetData().then(data => {
    if (data && data.length > 0) {
        const [headers, ...rows] = data; // Skip the first row if it contains headers
        collegesData = rows; // Store data for lookup
        showSuggestions(rows); // Show all colleges initially
    } else {
        console.error('No data found or invalid range.');
    }
});

// Event listeners
document.getElementById('calculate-btn').addEventListener('click', updateCostDisplay);

function updateCostDisplay() {
    const residencySelect = document.getElementById('residency-select');
    const livingArrangementSelect = document.getElementById('living-arrangement');
    const costDisplay = document.getElementById('cost-display');
    const collegeSearch = document.getElementById('college-search');

    const selectedCollege = collegeSearch.value;
    const residency = residencySelect.value;
    const livingArrangement = livingArrangementSelect.value;

    if (selectedCollege) {
        const collegeData = collegesData.find(([college]) => college === selectedCollege);

        if (collegeData) {
            const [ , outOfStateCost, , , inStateCost, onCampusCost ] = collegeData;
            let cost = residency === 'in-state' ? parseFloat(inStateCost) : parseFloat(outOfStateCost);
            const foodCost = parseFloat(document.getElementById('food-cost').value) || 0;
            const attendanceYears = parseFloat(document.getElementById('attendance-years').value) || 0;
            const costIncreaseRate = parseFloat(document.getElementById('college-cost-increase').value) || 0;

            cost += foodCost * attendanceYears; // Add food costs
            cost += (cost * (costIncreaseRate / 100)) * attendanceYears; // Add cost increase over years

            if (livingArrangement === 'on-campus') {
                cost += parseFloat(onCampusCost);
            } else if (livingArrangement === 'commuting') {
                const miles = parseFloat(document.getElementById('miles').value) || 0;
                const gasCost = parseFloat(document.getElementById('gas-cost').value) || 0;
                const averageMPG = 25; // Assume average miles per gallon
                const totalCommuteCost = (miles / averageMPG) * gasCost;
                cost += totalCommuteCost;
            }

            costDisplay.textContent = `Total Cost: $${cost.toFixed(2)}`;
        } else {
            costDisplay.textContent = 'Selected college not found.';
        }
    } else {
        costDisplay.textContent = 'Please select a college.';
    }
}

document.getElementById('calculate-btn').addEventListener('click', () => {
    const selectedCollege = document.getElementById('college-search').value;
    if (selectedCollege) {
        const collegeData = collegesData.find(([college]) => college.toLowerCase() === selectedCollege.toLowerCase());
        if (collegeData) {
            updateCostDisplay(); // Call your function to update cost display
        } else {
            alert('Please select a valid college from the suggestions.');
        }
    } else {
        alert('Please enter a college name to search.');
    }
});
