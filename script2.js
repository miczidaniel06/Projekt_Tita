const SUPABASE_URL = 'https://vkvrtvnztvjlpgzpufma.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Czl44GBcZnqV2VXcbsMtUw_UvHnKFgk';

const supabaseClient  = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

document.addEventListener('DOMContentLoaded', loadTasks);
addBtn.addEventListener('click', addTask);

async function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;
    
    const { data, error } = await supabaseClient 
        .from('tasks')
        .insert([{ text: taskText }])
        .select();

    if (error) {
        console.error('Error adding task:', error.message);
        alert('Could not save task to cloud.');
        return;
    }

    if (data && data[0]) {
        createTaskElement(data[0].text, data[0].id);
    }
    
    taskInput.value = '';
}

function createTaskElement(text, id) {
    const li = document.createElement('li');
    li.textContent = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.classList.add('delete-btn');
    
    deleteBtn.addEventListener('click', () => deleteTask(id, li));

    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}
async function loadTasks() {
    taskList.innerHTML = '';
    
    const { data: tasks, error } = await supabaseClient 
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading tasks:', error.message);
        return;
    }

    tasks.forEach(task => createTaskElement(task.text, task.id));
}

async function deleteTask(id, element) {
    const { error } = await supabaseClient
        .from('tasks')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting task:', error.message);
        alert('Could not delete task from cloud.');
        return;
    }

    element.remove();
}
