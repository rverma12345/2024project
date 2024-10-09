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
    // Only show suggestions if the input is not empty
    if (searchTerm) {
        const filteredColleges = collegesData.filter(([college]) => college.toLowerCase().includes(searchTerm));
        showSuggestions(filteredColleges); // Show matching colleges
    } else {
        document.getElementById('suggestions').style.display = 'none'; // Hide if input is empty
    }
};

// Use debounce to limit the frequency of input events
document.getElementById('college-search').addEventListener('input', debounce(onInputChange, 300)); // 300ms delay

// Show suggestions when input is focused
document.getElementById('college-search').addEventListener('focus', () => {
    const searchTerm = document.getElementById('college-search').value.toLowerCase();
    if (searchTerm) {
        const filteredColleges = collegesData.filter(([college]) => college.toLowerCase().includes(searchTerm));
        showSuggestions(filteredColleges);
    }
});

// Hide suggestions when input is blurred
document.getElementById('college-search').addEventListener('blur', () => {
    setTimeout(() => {
        document.getElementById('suggestions').style.display = 'none';
    }, 100); // Delay to allow for click on suggestion
});

// Fetch and populate colleges
fetchSheetData().then(data => {
    if (data && data.length > 0) {
        const [headers, ...rows] = data; // Skip the first row if it contains headers
        collegesData = rows; // Store data for lookup
    }
});

document.getElementById('living-arrangement').addEventListener('change', function() {
    const housingCostInput = document.getElementById('housing-cost');
    const housingCostLabel = document.getElementById('housing-cost-label');
    const commutingDetails = document.getElementById('commuting-details');

    if (this.value === 'on-campus') {
        housingCostInput.style.display = 'block';
        housingCostLabel.style.display = 'block';
        commutingDetails.style.display = 'none';
    } else {
        housingCostInput.style.display = 'none';
        housingCostLabel.style.display = 'none';
        commutingDetails.style.display = 'block';
        housingCostInput.value = ''; // Clear the input if switching to commuting
    }
});

document.getElementById('calculate-btn').addEventListener('click', updateCostDisplay);

function updateCostDisplay() {
    let cost = 0; // Initialize total cost

    const tuitionFee = parseFloat(document.getElementById('tuition-fee').value) || 0;
    const collegeCostIncrease = parseFloat(document.getElementById('college-cost-increase').value) || 0;
    const attendanceYears = parseInt(document.getElementById('attendance-years').value) || 0;
    const foodCost = parseFloat(document.getElementById('food-cost').value) || 0;
    const miscellaneousCost = parseFloat(document.getElementById('miscellaneous-cost').value) || 0;

    cost += tuitionFee; // Add tuition fee

    // Calculate the total cost with increase
    for (let year = 0; year < attendanceYears; year++) {
        cost += tuitionFee * Math.pow(1 + collegeCostIncrease / 100, year); // Compound increase
    }

    cost += foodCost; // Add food cost
    cost += miscellaneousCost; // Add miscellaneous expenses

    const livingArrangement = document.getElementById('living-arrangement').value;
    if (livingArrangement === 'on-campus') {
        const userHousingCost = parseFloat(document.getElementById('housing-cost').value) || 0;
        cost += userHousingCost; // Add user-defined housing cost
    } else if (livingArrangement === 'commuting') {
        const miles = parseFloat(document.getElementById('miles').value) || 0;
        const gasCost = parseFloat(document.getElementById('gas-cost').value) || 0;
        const averageMPG = 25; // Assume average miles per gallon
        const totalCommuteCost = (miles / averageMPG) * gasCost;
        cost += totalCommuteCost; // Add commuting cost
    }

    document.getElementById('cost-display').textContent = `Total Cost: $${cost.toFixed(2)}`;
}
