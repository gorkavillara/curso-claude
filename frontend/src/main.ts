import { api, type Task } from './api';

const form = document.getElementById('task-form') as HTMLFormElement;
const titleInput = document.getElementById('input-title') as HTMLInputElement;
const descriptionInput = document.getElementById('input-description') as HTMLTextAreaElement;
const list = document.getElementById('task-list') as HTMLUListElement;
const emptyState = document.getElementById('empty-state') as HTMLParagraphElement;

function render(data: Task[]): void {
  list.innerHTML = '';
  emptyState.hidden = data.length > 0;

  for (const task of data) {
    const item = document.createElement('li');
    item.className = task.completed ? 'task done' : 'task';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', async () => {
      await api.update(task.id, { completed: checkbox.checked });
      await refresh();
    });

    const content = document.createElement('div');
    content.className = 'task-content';

    const title = document.createElement('strong');
    title.textContent = task.title;

    const desc = document.createElement('span');
    desc.textContent = task.description;

    content.append(title, desc);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove';
    remove.textContent = 'Delete';
    remove.addEventListener('click', async () => {
      await api.remove(task.id);
      await refresh();
    });

    item.append(checkbox, content, remove);
    list.append(item);
  }
}

async function refresh(): Promise<void> {
  try {
    const data = await api.list();
    render(data);
  } catch (err) {
    console.error(err);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  await api.create({
    title,
    description: descriptionInput.value.trim(),
  });

  form.reset();
  titleInput.focus();
  await refresh();
});

void refresh();
