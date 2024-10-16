const apiUrl = "https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=QpcoJvRbjb8tW4mMHeFLs03clHditVf3AeppBdJC&fields=school.name,latest.cost.tuition.out_of_state,latest.cost.tuition.in_state";
let collegesData = [];

async function fetchCollegesData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            collegesData = data.results.map(college => ({
                name: college["school.name"],
                tuitionOutOfState: college["latest.cost.tuition.out_of_state"],
                tuitionInState: college["latest.cost.tuition.in_state"]
            }));
        } else {
            console.error('No colleges found.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Debounce function
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Handle input change
const onInputChange = () => {
    const searchTerm = document.getElementById('college-search').value.toLowerCase();
    const suggestionsContainer = document.getElementById('suggestions');

    if (searchTerm) {
        const filteredColleges = collegesData.filter(college => college.name.toLowerCase().startsWith(searchTerm));
        showSuggestions(filteredColleges);
    } else {
        suggestionsContainer.style.display = 'none';
    }
};

// Show suggestions
function showSuggestions(colleges) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';

    if (colleges.length > 0) {
        suggestionsContainer.style.display = 'block';
        colleges.forEach(college => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item');
            item.textContent = college.name;
            item.onclick = () => selectCollege(college);
            suggestionsContainer.appendChild(item);
        });
    } else {
        suggestionsContainer.style.display = 'none';
    }
}

// Function to handle college selection
function selectCollege(college) {
    document.getElementById('college-search').value = college.name;
    const residency = document.getElementById('residency-select').value;

    // Set tuition based on residency selection
    document.getElementById('tuition-fee').value = residency === 'out-of-state'
        ? college.tuitionOutOfState || 0
        : college.tuitionInState || 0;

    document.getElementById('suggestions').style.display = 'none';
}

// Event listeners
document.getElementById('college-search').addEventListener('input', debounce(onInputChange, 300));
document.getElementById('residency-select').addEventListener('change', () => {
    const selectedCollegeName = document.getElementById('college-search').value;
    const selectedCollege = collegesData.find(college => college.name === selectedCollegeName);
    if (selectedCollege) {
        document.getElementById('tuition-fee').value = document.getElementById('residency-select').value === 'out-of-state'
            ? selectedCollege.tuitionOutOfState || 0
            : selectedCollege.tuitionInState || 0;
    }
});

document.getElementById('calculate-btn').addEventListener('click', calculateTotalCost);
document.getElementById('living-arrangement').addEventListener('change', toggleCommutingFields);

// Toggle commuting fields visibility
function toggleCommutingFields() {
    const livingArrangement = document.getElementById('living-arrangement').value;
    const commutingDetails = document.getElementById('commuting-details');

    if (livingArrangement === 'commuting') {
        commutingDetails.style.display = 'block';
    } else {
        commutingDetails.style.display = 'none';
    }
}

// Calculate total cost
function calculateTotalCost() {
    const tuitionFee = parseFloat(document.getElementById('tuition-fee').value) || 0;
    const housingCost = parseFloat(document.getElementById('housing-cost').value) || 0;
    const foodCost = parseFloat(document.getElementById('food-cost').value) || 0;
    const miscellaneousCost = parseFloat(document.getElementById('miscellaneous-cost').value) || 0;
    const collegeCostIncrease = parseFloat(document.getElementById('college-cost-increase').value) || 0;
    const attendanceYears = parseInt(document.getElementById('attendance-years').value) || 1;

    let totalCost = 0;
    let breakdownList = [];

    // Tuition
    for (let i = 0; i < attendanceYears; i++) {
        totalCost += tuitionFee * Math.pow(1 + collegeCostIncrease / 100, i);
        breakdownList.push(`Year ${i + 1} Tuition: $${(tuitionFee * Math.pow(1 + collegeCostIncrease / 100, i)).toFixed(2)}`);
    }

    // Housing
    if (document.getElementById('living-arrangement').value === 'on-campus') {
        for (let i = 0; i < attendanceYears; i++) {
            totalCost += housingCost * Math.pow(1 + collegeCostIncrease / 100, i);
            breakdownList.push(`Year ${i + 1} Housing: $${(housingCost * Math.pow(1 + collegeCostIncrease / 100, i)).toFixed(2)}`);
        }
    }

    // Food
    for (let i = 0; i < attendanceYears; i++) {
        totalCost += foodCost * Math.pow(1 + collegeCostIncrease / 100, i);
        breakdownList.push(`Year ${i + 1} Food: $${(foodCost * Math.pow(1 + collegeCostIncrease / 100, i)).toFixed(2)}`);
    }

    // Miscellaneous
    for (let i = 0; i < attendanceYears; i++) {
        totalCost += miscellaneousCost * Math.pow(1 + collegeCostIncrease / 100, i);
        breakdownList.push(`Year ${i + 1} Miscellaneous: $${(miscellaneousCost * Math.pow(1 + collegeCostIncrease / 100, i)).toFixed(2)}`);
    }

    // Update display
    document.getElementById('cost-display').textContent = `Total Cost: $${totalCost.toFixed(2)}`;
    document.getElementById('breakdown-list').innerHTML = breakdownList.map(item => `<li>${item}</li>`).join('');
    document.getElementById('cost-breakdown').style.display = 'block';
}

// Fetch data on page load
fetchCollegesData();
