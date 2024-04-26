window.onload = function () {
    const lastVisitedSection = localStorage.getItem("lastVisitedSection");
    if (lastVisitedSection) {
        showSection('homeSection');
    } else {
        showSection(lastVisitedSection);
    }
};

let deadlineSortOrder = 'asc'; // Default sorting order
let prioritySortOrder = 'asc'; // Default sorting order for priority

function toggleDeadlineSort() {
    deadlineSortOrder = deadlineSortOrder === 'asc' ? 'desc' : 'asc';
    filterProgressTasks();
}

function togglePrioritySort() {
    prioritySortOrder = prioritySortOrder === 'asc' ? 'desc' : 'asc';
    filterProgressTasks();
}
function filterProgressTasks() {
    // Sorting function based on the deadline date and priority
    const sortFunction = (a, b) => {
        const dateA = new Date(a.deadline);
        const dateB = new Date(b.deadline);

        // First, sort by deadline
        if (dateA < dateB) return deadlineSortOrder === 'asc' ? -1 : 1;
        if (dateA > dateB) return deadlineSortOrder === 'asc' ? 1 : -1;

        // If deadlines are equal, sort by priority
        const priorityOrder = { 'top': 0, 'middle': 1, 'low': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    };

    // Retrieve and sort tasks
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const inProgressTasks = tasks.filter(task => task.status === 'inProgress').sort(sortFunction);

    // Update the table with sorted tasks
    const inProgressTableBody = document.getElementById("progressTableBody");
    inProgressTableBody.innerHTML = "";
    const priorityMap = {
        'top': 'Top Priority',
        'middle': 'Middle Priority',
        'low': 'Less Priority'
    };

    inProgressTasks.forEach(task => {
        const row = createTaskRow(task, priorityMap);
        inProgressTableBody.appendChild(row);
    });
}


function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    document.getElementById(sectionId).style.display = 'block';
    localStorage.setItem("lastVisitedSection", sectionId);

    // Exclude hiding the activateButton when the section is 'progressSection'
    if (sectionId !== 'progressSection') {
        const activateButtons = document.querySelectorAll('.activateButton');
        activateButtons.forEach(button => {
            button.style.display = 'inline-block';
        });
    }

    if (sectionId === 'progressSection' || sectionId === 'completedSection' || sectionId === 'deletedSection') {
        loadTasks();
    }
}
function addTask() {
const taskName = document.getElementById("taskName").value;
const priority = document.getElementById("priority").value;
const deadline = document.getElementById("deadline").value;

    // Validate if the taskName, priority, and deadline are provided
    if (!taskName || !priority || !deadline) {
        alert("Please enter task name, select priority, and choose a deadline.");
        return;
    }

    // Validate if the task with the same name, priority, and deadline already exists
    if (isDuplicateTaskName(taskName)) {
    alert("Task with the same name already exists.");
    return;
    }
    if (isDuplicateTask(taskName, priority, deadline)) {
    alert("Task with the same name, priority, and deadline already exists.");
    return;
}

    // Validate if the selected deadline is after the current date
    const currentDate = new Date().toISOString().split('T')[0];
    if (deadline < currentDate) {
        alert("Deadline should be after the current date.");
        return;
    }

    const task = {
        id: generateUniqueID(),
        name: taskName,
        priority: priority,
        deadline: deadline,
        status: "inactive"
    };

    saveTask(task);

    document.getElementById("taskName").value = "";
    document.getElementById("priority").value = "";
    document.getElementById("deadline").value = "";

    loadTasks();
    
}
function generateUniqueID() {
// Logic to generate a unique ID (e.g., increment a counter or use UUIDs)
// For example:
return Math.floor(Math.random() * 10000); // This is a simple example, not for production
}


// Function to check if a task with the same name, priority, and deadline already exists
function isDuplicateTask(taskName, priority, deadline) {
const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
return tasks.some(task => task.name === taskName && task.priority === priority && task.deadline === deadline);
}

function isDuplicateTaskName(taskName) {
const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
return tasks.some(task => task.name === taskName);
}


function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

 function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const taskTableBody = document.getElementById("taskTableBody");
    const inProgressTableBody = document.getElementById("progressTableBody");
    const completedTableBody = document.getElementById("completedTableBody");
    const deletedTableBody = document.getElementById("deletedTableBody");
    const inProgressTasks = tasks.filter(task => task.status === 'inProgress').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inactiveTasks = tasks.filter(task => task.status === 'inactive').length;

    document.getElementById("tasksInProgress").textContent = inProgressTasks;
    document.getElementById("completedTasks").textContent = completedTasks;
    document.getElementById("inactiveTasks").textContent = inactiveTasks;

    

    taskTableBody.innerHTML = "";
    inProgressTableBody.innerHTML = "";
    completedTableBody.innerHTML = "";
    deletedTableBody.innerHTML = "";

    const priorityMap = {
        'top': 'Top Priority',
        'middle': 'Middle Priority',
        'low': 'Less Priority'
    };

    tasks.forEach(task => {
        const row = createTaskRow(task, priorityMap);

        if (task.status === "inactive") {
            taskTableBody.appendChild(row);
        } else if (task.status === "inProgress") {
            inProgressTableBody.appendChild(row);
        } else if (task.status === "completed") {
            completedTableBody.appendChild(row);
        } else if (task.status === "deleted") {
            deletedTableBody.appendChild(row);
        }
    });
}

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.textContent = `${task.name} (Priority: ${priorityMap[task.priority]}, Deadline: ${task.deadline})`;

        if (task.status === "inactive") {
            li.innerHTML += `
                <div class="button-container">
                    <button class="activateButton" onclick="activateTask('${task.id}')">Activate</button>
                    <button class="deleteButton" onclick="deleteTask('${task.id}', false)">Delete</button>
                </div>
            `;
        } else if (task.status === "inProgress") {
            const progress = task.progress || 0;
            const updateButton = getUpdateButtonHTML(task.name);
            const completedButton = getCompletedButtonHTML(task.name);

            li.innerHTML += `
                <div class="button-container">
                    <div class="progress-bar" style="width: ${progress}%">${progress}%</div>
                    <button onclick="completeTask('${task.name}')">Complete</button>
                    ${updateButton}
                    ${completedButton}
                </div>`;
        } else if (task.status === "completed") {
            li.innerHTML += `
                <div class="button-container">
                    <button class="deleteButton" onclick="deleteTask('${task.name}', true)">Delete</button>
                </div>`;
        } else if (task.status === "deleted") {
            li.innerHTML += `
                <div class="button-container">
                    <button class="restoreButton" onclick="restoreTask('${task.name}')">Restore</button>
                </div>`;
        }

        if (task.status !== "deleted") {
            if (task.status === "completed") {
                completedTableBody.appendChild(createTaskRow(task, priorityMap));
            } else if (task.status === "inProgress") {
                inProgressTableBody.appendChild(createTaskRow(task, priorityMap));
            }
        } else {
            deletedTableBody.appendChild(createTaskRow(task, priorityMap));
        }

        // Add task to the task table
        taskTableBody.appendChild(createTaskRow(task, priorityMap));
    });
    function searchTasks() {
        const searchInput = document.getElementById("searchInput").value.toLowerCase();
        const inProgressTableBody = document.getElementById("progressTableBody");
        const rows = inProgressTableBody.getElementsByTagName("tr");
    
        for (let row of rows) {
            const taskName = row.getElementsByTagName("td")[1]; // Assuming Task Name is in the second cell
            const priority = row.getElementsByTagName("td")[2]; // Assuming Priority is in the third cell
            const taskId = row.getElementsByTagName("td")[0]; // Assuming ID is in the first cell
    
            if (taskName && priority && taskId) {
                const name = taskName.textContent.toLowerCase();
                const taskPriority = priority.textContent.toLowerCase();
                const id = taskId.textContent.toLowerCase();
    
                if (name.includes(searchInput) || taskPriority.includes(searchInput) || id.includes(searchInput)) {
                    row.style.display = ""; // Show the row if the task name, priority, or ID matches the search
                } else {
                    row.style.display = "none"; // Hide the row if neither the task name, priority, nor ID matches
                }
            }
        }
    }


    function createTaskRow(task, priorityMap) {
        const row = document.createElement("tr");
        const cellId = document.createElement("td");
        const cellName = document.createElement("td");
        const cellPriority = document.createElement("td");
        const cellDeadline = document.createElement("td");
        const cellAction = document.createElement("td");
        const cellProgress = document.createElement("td");
        const celltimerminder = document.createElement("td");
    
        cellId.textContent = task.id;
        cellName.textContent = task.name;
        cellPriority.textContent = priorityMap[task.priority];
        cellDeadline.textContent = task.deadline;
    
        cellPriority.classList.add('priority-cell');
    
        if (task.priority === 'low') {
            cellPriority.classList.add('low-priority');
        } else if (task.priority === 'middle') {
            cellPriority.classList.add('middle-priority');
        } else if (task.priority === 'top') {
            cellPriority.classList.add('top-priority');
        }
    
        if (task.status === "inactive") {
            cellAction.innerHTML = `
                <div class="button-container">
                    <button class="activateButton" onclick="activateTask('${task.name}')">Activate</button>
                    <button class="deleteButton" onclick="deleteTask('${task.name}', false)">Delete</button>
                </div>
            `;
        } else if (task.status === "completed") {
            cellAction.innerHTML = `
                <div class="button-container">
                    <button class="deleteButton" onclick="deleteTask('${task.name}', true)">Delete</button>
                </div>
            `;
        } else if (task.status === "deleted") {
            cellAction.innerHTML = `
                <div class="button-container">
                    <button class="restoreButton" onclick="restoreTask('${task.name}')">Restore</button>
                </div>
            `;
        } else if (task.status === "inProgress") {
            const progress = task.progress || 0;
            cellProgress.innerHTML = `
                <div class="progress-bar" style="width: ${progress}%">${progress}%</div>
            `;
            cellAction.innerHTML = `
                <div class="button-container">
                    <button class="updateButton" onclick="updateTask('${task.name}')">Update</button>
                </div>
            `;
    
            const deadlineTime = new Date(task.deadline).getTime();
            const now = new Date().getTime();
            const timeDifference = deadlineTime - now;
    
            if (timeDifference > 0) {
                const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
    
                celltimerminder.textContent = `Time remaining: ${days}d ${hours}h ${minutes}m ${seconds}s`;
            } else {
                celltimerminder.textContent = "Deadline passed";
                celltimerminder.style.backgroundColor = "red";
                celltimerminder.style.borderRadius="10px";
                celltimerminder.style.textAlign="center";
            }
        }
    
        row.appendChild(cellId);
        row.appendChild(cellName);
        row.appendChild(cellPriority);
        row.appendChild(cellDeadline);
        row.appendChild(cellAction);
        row.appendChild(cellProgress);
        row.appendChild(celltimerminder);
    
        return row;
    }
    

function getUpdateButtonHTML(taskName) {
    return `<button class="updateButton" onclick="updateTask('${taskName}')">Update</button>`;
}
function updateTaskProgress(taskName, progress) {
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
tasks.forEach(task => {
    if (task.name === taskName && task.status === "inProgress") {
        task.progress = progress;

        if (progress === 100) {
            task.status = "completed"; // Update the task status to completed
        }
    }
});
localStorage.setItem("tasks", JSON.stringify(tasks));
loadTasks(); // Reload the tasks to update UI
}



function activateTask(taskName) {
updateTaskStatus(taskName, "inProgress");
loadTasks();
}

function completeTask(taskName) {
    updateTaskStatus(taskName, "completed");
    loadTasks();
}

function deleteTask(taskName) {
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks.forEach(task => {
    if (task.name === taskName) {
        task.status = "deleted";
    }
});

localStorage.setItem("tasks", JSON.stringify(tasks));
loadTasks();
}


function restoreTask(taskName) {
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks.forEach(task => {
    if (task.name === taskName && task.status === "deleted") {
        task.status = "inactive";
    }
});

localStorage.setItem("tasks", JSON.stringify(tasks));
loadTasks();
}

function activateTask(taskName) {
    updateTaskStatus(taskName, "inProgress");
    loadTasks();

    // Reload both "taskSection" and "progressSection"
    showSection('taskSection');
    showSection('progressSection');
}

function updateTaskStatus(taskName, newStatus) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => {
        if (task.name === taskName) {
            task.status = newStatus;
        }
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTask(taskName) {
    const progressInput = prompt("Enter progress (1-100):");
    const progress = parseInt(progressInput);

    if (!isNaN(progress) && progress >= 1 && progress <= 100) {
        updateTaskProgress(taskName, progress);
        loadTasks();
    } else {
        alert("Invalid input. Please enter a number between 1 and 100.");
    }
}

function updateTask(taskId) {
        // Use prompt or another method to get progress input
        const progressInput = prompt("Enter progress (1-100):");
        const progress = parseInt(progressInput);

        if (!isNaN(progress) && progress >= 1 && progress <= 100) {
            updateTaskProgress(taskId, progress);
            loadTasks();
        } else {
            alert("Invalid input. Please enter a number between 1 and 100.");
        }
    }
function showSection(sectionId) {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
    
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.classList.remove('active'); // Remove 'active' class from all links
        });
    
        const activeLink = document.querySelector(`nav a[href="#"][onclick="showSection('${sectionId}')"]`);
        if (activeLink) {
            activeLink.classList.add('active'); // Add 'active' class to the current link
        }
    
        document.getElementById(sectionId).style.display = 'block';
        localStorage.setItem("lastVisitedSection", sectionId);
    
        // Exclude hiding the activateButton when the section is 'progressSection'
        if (sectionId !== 'progressSection') {
            const activateButtons = document.querySelectorAll('.activateButton');
            activateButtons.forEach(button => {
                button.style.display = 'inline-block';
            });
        }
    
        if (sectionId === 'progressSection' || sectionId === 'completedSection' || sectionId === 'deletedSection') {
            loadTasks();
            
        }}
        
        