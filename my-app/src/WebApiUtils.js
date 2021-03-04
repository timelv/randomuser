export const getAllContacts = async (numberOfUsers) => {
  return fetch(`https://randomuser.me/api/?results=${numberOfUsers}`)
    .then(response => response.json())
    .then(data => {
      return data;
    });
};