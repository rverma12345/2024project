const apiKey = "QpcoJvRbjb8tW4mMHeFLs03clHditVf3AeppBdJC";
const apiUrl = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${apiKey}&fields=school.name,latest.cost.tuition.out_of_state,latest.cost.tuition.in_state`;

let collegesData = [];
let chart;

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
            console.error("No results found.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

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

function onInputChange() {
    const searchTerm = document.getElementById('college-search').value.toLowerCase();
    if (searchTerm) {
        const filteredColleges = collegesData.filter(college => college.name.toLowerCase().includes(searchTerm));
        showSuggestions(filteredColleges);
    } else {
        document.getElementById('suggestions').style.display = 'none';
    }
}

function selectCollege(college) {
    document.getElementById('college-search').value = college.name;
    document.getElementById('suggestions').style.display = 'none';
    updateTuition(college);
}

function updateTuition(college) {
    const residency = document.getElementById('residency-select').value;
    document.getElementById('tuition-fee').value = residency === 'in-state' ? college.tuitionInState : college.tuitionOutOfState;
}

document.getElementById('residency-select').addEventListener('change', () => {
    const collegeName = document.getElementById('college-search').value;
    const college = collegesData.find(c => c.name === collegeName);
    if (college) {
        updateTuition(college);
    }
});

document.getElementById('living-arrangement').addEventListener('change', function() {
    const livingArrangement = this.value;
    document.getElementById('housing-cost-container').style.display = livingArrangement === 'on-campus' ? 'block' : 'none';
    document.getElementById('commuting-details').style.display = livingArrangement === 'commuting' ? 'block' : 'none';
});

function calculateTotalCost() {
    const tuition = parseFloat(document.getElementById('tuition-fee').value) || 0;
    const years = parseInt(document.getElementById('attendance-years').value) || 1;
    const increaseRate = parseFloat(document.getElementById('college-cost-increase').value) || 0;
    const foodCost = parseFloat(document.getElementById('food-cost').value) || 0;
    const miscCost = parseFloat(document.getElementById('miscellaneous-cost').value) || 0;

    let totalCost = 0;

    for (let year = 0; year < years; year++) {
        const adjustedTuition = tuition * Math.pow(1 + increaseRate / 100, year);
        totalCost += adjustedTuition + foodCost + miscCost;

        const livingArrangement = document.getElementById('living-arrangement').value;
        if (livingArrangement === 'on-campus') {
            const housingCost = parseFloat(document.getElementById('housing-cost').value) || 0;
            totalCost += housingCost;
        } else if (livingArrangement === 'commuting') {
            const miles = parseFloat(document.getElementById('miles').value) || 0;
            const mpg = parseFloat(document.getElementById('mpg').value) || 0;
            const gasCost = parseFloat(document.getElementById('gas-cost').value) || 0;
            const parkingCost = parseFloat(document.getElementById('parking-cost').value) || 0;

            const commuteCost = (miles / mpg) * gasCost * 365; // Daily commute cost annually
            totalCost += commuteCost + (parkingCost * 12); // Annual parking cost
        }
    }

    document.getElementById('cost-display').textContent = `Total Cost: $${totalCost.toFixed(2)}`;
    return totalCost;
}

document.getElementById('calculate-btn').addEventListener('click', function() {
    const totalCost = calculateTotalCost();
    return totalCost;
});

document.getElementById('graph-btn').addEventListener('click', function() {
    const collegeName = document.getElementById('college-search').value;
    const totalCost = calculateTotalCost();

    if (chart) {
        chart.data.labels.push(collegeName);
        chart.data.datasets[0].data.push(totalCost);
        chart.update();
    } else {
        const ctx = document.getElementById('costChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [collegeName],
                datasets: [{
                    label: 'Total Cost ($)',
                    data: [totalCost],
                    backgroundColor: 'rgba(41, 128, 185, 0.5)',
                    borderColor: 'rgba(41, 128, 185, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        document.getElementById('costChart').style.display = 'block'; // Show the chart
    }
});

document.getElementById('college-search').addEventListener('input', onInputChange);
document.getElementById('search-btn').addEventListener('click', function() {
    const query = document.getElementById('google-search').value;
    if (query) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
});

document.getElementById('continue-btn').addEventListener('click', function() {
    document.getElementById('intro-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
});



fetchCollegesData();
