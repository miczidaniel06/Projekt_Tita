// 1. Configure your Supabase credentials
const SUPABASE_URL = 'https://vkvrtvnztvjlpgzpufma.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_Czl44GBcZnqV2VXcbsMtUw_UvHnKFgk';

// 2. Initialize the Supabase Client
const supabase = createClient.supabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

// Load tasks from cloud database when page opens
document.addEventListener('DOMContentLoaded', loadTasks);
addBtn.addEventListener('click', addTask);

// 3. Add a task to the Cloud Database
async function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    // Insert task into Supabase table
    const { data, error } = await supabase
        .from('tasks')
        .insert([{ text: taskText }])
        .select();

    if (error) {
        console.error('Error adding task:', error.message);
        alert('Could not save task to cloud.');
        return;
    }

    // Render the task using the ID returned from Supabase
    if (data && data[0]) {
        createTaskElement(data[0].text, data[0].id);
    }
    
    taskInput.value = '';
}

// Helper to render task in DOM
function createTaskElement(text, id) {
    const li = document.createElement('li');
    li.textContent = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.classList.add('delete-btn');
    
    // Wire up deletion using the database row ID
    deleteBtn.addEventListener('click', () => deleteTask(id, li));

    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

// 4. Fetch all tasks from the Cloud Database
async function loadTasks() {
    taskList.innerHTML = ''; // Clear list
    
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading tasks:', error.message);
        return;
    }

    tasks.forEach(task => createTaskElement(task.text, task.id));
}

// 5. Delete a task from the Cloud Database
async function deleteTask(id, element) {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting task:', error.message);
        alert('Could not delete task from cloud.');
        return;
    }

    element.remove(); // Remove from UI only if DB deletion succeeds
}
