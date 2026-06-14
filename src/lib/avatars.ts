
'use client';

export const APP_AVATARS = [
  { key: 'dino', emoji: '🦖', label: 'Dinosaurio' },
  { key: 'car', emoji: '🚗', label: 'Carro' },
  { key: 'star', emoji: '⭐', label: 'Estrella' },
  { key: 'rocket', emoji: '🚀', label: 'Cohete' },
  { key: 'lion', emoji: '🦁', label: 'León' },
  { key: 'cat', emoji: '🐱', label: 'Gato' },
  { key: 'dog', emoji: '🐶', label: 'Perro' },
  { key: 'unicorn', emoji: '🦄', label: 'Unicornio' },
  { key: 'robot', emoji: '🤖', label: 'Robot' },
  { key: 'rainbow', emoji: '🌈', label: 'Arcoíris' },
  { key: 'ball', emoji: '⚽', label: 'Pelota' },
  { key: 'book', emoji: '📖', label: 'Libro' },
  { key: 'flower', emoji: '🌸', label: 'Flor' },
  { key: 'butterfly', emoji: '🦋', label: 'Mariposa' },
  { key: 'planet', emoji: '🪐', label: 'Planeta' },
];

export const getAvatarEmoji = (key?: string) => {
  return APP_AVATARS.find(a => a.key === key)?.emoji || '👤';
};
