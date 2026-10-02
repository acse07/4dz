const API_URL = 'https://inai-col1.fishrungames.com/ads';
const cards = document.querySelector('#cards');
const listStatus = document.querySelector('#list-status');
const formStatus = document.querySelector('#form-status');
const form = document.querySelector('#ad-form');
const submitButton = document.querySelector('#submit');
const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function renderAds(items) {
  cards.replaceChildren();

  if (!items.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Пока нет объявлений.';
    cards.append(empty);
    return;
  }

  for (const ad of items) {
    const card = document.createElement('article');
    card.className = 'card';

    const image = document.createElement('img');
    image.className = 'photo';
    image.alt = ad.title || 'Изображение объявления';
    if (ad.image_url) image.src = new URL(ad.image_url, API_URL).href;
    card.append(image);

    const details = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = ad.title || 'Без названия';
    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = ad.description || '';
    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = `${money.format(Number(ad.price) || 0)} сом`;
    details.append(title, description, price);
    card.append(details);
    cards.append(card);
  }
}

async function loadAds() {
  setStatus(listStatus, 'Загружаем объявления…');
  document.querySelector('#refresh').disabled = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data.items)) throw new Error('Неверный формат ответа');

    renderAds(data.items);
    setStatus(listStatus, `Объявлений: ${data.total ?? data.items.length}`);
  } catch (error) {
    setStatus(listStatus, `Не удалось загрузить объявления: ${error.message}`, true);
  } finally {
    document.querySelector('#refresh').disabled = false;
  }
}

document.querySelector('#refresh').addEventListener('click', loadAds);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  submitButton.disabled = true;
  setStatus(formStatus, 'Отправляем объявление…');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: new FormData(form)
    });
    if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

    await response.json();
    form.reset();
    setStatus(formStatus, 'Объявление опубликовано.');
    await loadAds();
  } catch (error) {
    setStatus(formStatus, `Не удалось отправить объявление: ${error.message}`, true);
  } finally {
    submitButton.disabled = false;
  }
});

loadAds();
