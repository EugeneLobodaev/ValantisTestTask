export const fetchData = (url: string) => {
  return fetch(url).then((response) => response.json());
};
