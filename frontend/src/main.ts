import { api, type Task } from './api';

const form = document.getElementById('task-form') as HTMLFormElement;
const titleInput = document.getElementById('input-title') as HTMLInputElement;
const descriptionInput = document.getElementById('input-description') as HTMLTextAreaElement;
const tagsInput = document.getElementById('input-tags') as HTMLInputElement;
const list = document.getElementById('task-list') as HTMLUListElement;
const emptyState = document.getElementById('empty-state') as HTMLParagraphElement;
const filterBar = document.getElementById('filter-bar') as HTMLDivElement;
const filterTag = document.getElementById('filter-tag') as HTMLSpanElement;
const filterClear = document.getElementById('filter-clear') as HTMLButtonElement;

let activeTag: string | null = null;

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t !== '');
}

function setFilter(tag: string | null): void {
  activeTag = tag;
  if (tag) {
    filterTag.textContent = tag;
    filterBar.hidden = false;
  } else {
    filterBar.hidden = true;
  }
  void refresh();
}

function render(tasks: Task[]): void {
  list.innerHTML = '';
  emptyState.hidden = tasks.length > 0;

  for (const task of tasks) {
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

    if (task.tags.length > 0) {
      const tagRow = document.createElement('div');
      tagRow.className = 'tag-row';
      for (const tag of task.tags) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.textContent = tag;
        chip.addEventListener('click', () => setFilter(tag));
        tagRow.append(chip);
      }
      content.append(tagRow);
    }

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
    const tasks = await api.list(activeTag ?? undefined);
    render(tasks);
  } catch (err) {
    console.error(err);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  try {
    await api.create({
      title,
      description: descriptionInput.value.trim(),
      tags: parseTags(tagsInput.value),
    });
  } catch (err) {
    alert((err as Error).message);
    return;
  }

  form.reset();
  titleInput.focus();
  await refresh();
});

filterClear.addEventListener('click', () => setFilter(null));

void refresh();
