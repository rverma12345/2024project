document.addEventListener("DOMContentLoaded", function () {
    const introPage = document.getElementById("intro-page");
    const mainApp = document.getElementById("main-app");
    const continueBtn = document.getElementById("continue-btn");
    const collegeSearchInput = document.getElementById("college-search");
    const suggestionsContainer = document.getElementById("suggestions");
    const residencyContainer = document.getElementById("residency-container");
    const calculateContainer = document.getElementById("calculate-container");
    const calculateBtn = document.getElementById("calculate-btn");
    const costDisplay = document.getElementById("cost-display");
    const residencySelect = document.getElementById("residency-select");
    const collegeInfo = document.getElementById("college-info");
    const collegeWebsiteButton = document.getElementById("college-website-button");
    const favoritesContainer = document.getElementById("favorites-container");

    let colleges = [];
    let collegeLinks = [];
    let collegeCities = [];
    let collegeStates = [];
    let collegePublicPrivate = [];
    let selectedCollegeIndex = -1;
    let collegeMascots = [];
    let favorites = [];

    // Google API credentials
    const googleApiKey = "AIzaSyByIj5HheJZEZh-yl0Htqb8tjLNQvRG0gg"; // Replace with your Google API Key
    const googleCx = "057634c68697e4dfc"; // Replace with your Custom Search Engine ID

    // Fetch college names and links from Google Sheets
    const fetchColleges = async () => {
        const apiKey = "AIzaSyCfrP-vedjtT-jxoXR9Adco8YUV2cRyUaY"; // Replace with your actual API Key
        const spreadsheetId = "1SCwi8zWoxq9pa2LSmu0dfcakdju8RCYZ7n51_Fgprfc"; // Replace with your spreadsheet ID
        const range = "Sheet1!A:M"; // Fetch columns A (college names), B (URLs), C (Cities), D (States), H (Public/Private)
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.values) {
                colleges = data.values.map(row => row[0]); // Column A: college names
                collegeLinks = data.values.map(row => row[1]); // Column B: college links
                collegeCities = data.values.map(row => row[2]); // Column C: city
                collegeStates = data.values.map(row => row[3]); // Column D: state
                collegePublicPrivate = data.values.map(row => row[7]); // Column H: public/private status
                collegeMascots = data.values.map(row => row[12]); // Column M: mascots
            }
        } catch (error) {
            console.error("Error fetching college names and links from Google Sheets:", error);
        }
    };

    // Handle continue button click
    continueBtn.addEventListener("click", function () {
        introPage.style.display = "none";
        mainApp.style.display = "flex";
        collegeSearchInput.focus();
    });

    // Handle college search input
    collegeSearchInput.addEventListener("input", function () {
        const query = collegeSearchInput.value.toLowerCase();
        if (query.length > 0) {
            showSuggestions(query);
        } else {
            suggestionsContainer.innerHTML = ''; // Clear suggestions when input is empty
        }
    });

    // Show college suggestions based on the query
    function showSuggestions(query) {
        const filteredColleges = colleges.filter((college) =>
            college.toLowerCase().includes(query)
        );

        suggestionsContainer.innerHTML = ''; // Clear previous suggestions
        if (filteredColleges.length === 0) {
            suggestionsContainer.innerHTML = '<div class="suggestion-item">No results found</div>';
        } else {
            filteredColleges.forEach((college) => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = college;

                // Add event listener to handle college selection
                suggestionItem.addEventListener('click', function () {
                    collegeSearchInput.value = college;
                    suggestionsContainer.innerHTML = ''; // Clear suggestions after selection

                    // Set the selected college index
                    selectedCollegeIndex = colleges.indexOf(college);

                    // Show residency selection
                    residencyContainer.style.display = 'block';

                    // Display the college information
                    displayCollegeInfo();
                });

                suggestionsContainer.appendChild(suggestionItem);
            });
        }
    }

    // Display college information
    function displayCollegeInfo() {
        const collegeName = colleges[selectedCollegeIndex];
        const city = collegeCities[selectedCollegeIndex];
        const state = collegeStates[selectedCollegeIndex];
        const publicPrivate = collegePublicPrivate[selectedCollegeIndex];
        const mascot = collegeMascots[selectedCollegeIndex];

        document.getElementById('college-name').textContent = collegeName;
        document.getElementById('college-location').textContent = `${city}, ${state}`;
        document.getElementById('college-mascot').textContent = `Mascot: ${mascot || 'N/A'}`;
        document.getElementById('college-public-status').textContent = publicPrivate;

        collegeInfo.style.display = 'block';
        collegeWebsiteButton.onclick = () => window.open(collegeLinks[selectedCollegeIndex], '_blank');
    }

    // Handle residency selection
    residencySelect.addEventListener('change', function() {
        calculateContainer.style.display = 'block';
    });

    // Handle "Calculate Cost" button click
    calculateBtn.addEventListener("click", function () {
        const residency = residencySelect.value;

        // Placeholder calculation (you can modify it based on real data or cost estimation logic)
        let baseCost = 30000; // Placeholder base tuition cost
        if (residency === "out-of-state") {
            baseCost += 10000; // Additional cost for out-of-state students
        } else if (residency === "international") {
            baseCost += 20000; // Additional cost for international students
        }
        costDisplay.textContent = `Total Cost: $${baseCost.toFixed(2)}`;
        costDisplay.style.display = 'block';
    });

    // Function to toggle favorite status
    function toggleFavorite(college) {
        const index = favorites.findIndex(fav => fav.name === college.name);
        if (index === -1) {
            favorites.push(college);
        } else {
            favorites.splice(index, 1);
        }
        updateFavoritesList();
    }

    // Function to update favorites list
    function updateFavoritesList() {
        favoritesContainer.innerHTML = '';
        favorites.forEach(college => {
            const item = document.createElement('div');
            item.classList.add('favorite-item');
            item.innerHTML = `
                <h4>${college.name}</h4>
                <p>${college.location}</p>
                <p>${college.publicPrivate}</p>
                <p>Mascot: ${college.mascot}</p>
                <button class="unfavorite-btn">
                    <i data-lucide="star" class="star-icon"></i>
                </button>
            `;
            const unfavoriteBtn = item.querySelector('.unfavorite-btn');
            unfavoriteBtn.addEventListener('click', () => toggleFavorite(college));
            favoritesContainer.appendChild(item);
        });
        lucide.createIcons();
    }

    // Add favorite button to college info
    const favoriteBtn = document.createElement('button');
    favoriteBtn.classList.add('favorite-btn');
    favoriteBtn.innerHTML = '<i data-lucide="star" class="star-icon"></i>';
    collegeInfo.appendChild(favoriteBtn);

    favoriteBtn.addEventListener('click', function() {
        const college = {
            name: colleges[selectedCollegeIndex],
            location: `${collegeCities[selectedCollegeIndex]}, ${collegeStates[selectedCollegeIndex]}`,
            publicPrivate: collegePublicPrivate[selectedCollegeIndex],
            mascot: collegeMascots[selectedCollegeIndex] || 'N/A'
        };
        toggleFavorite(college);
        updateFavoriteButton();
    });

    function updateFavoriteButton() {
        const isFavorite = favorites.some(fav => fav.name === colleges[selectedCollegeIndex]);
        favoriteBtn.classList.toggle('active', isFavorite);
    }

    // Initialize the app
    fetchColleges();
    lucide.createIcons();
});
