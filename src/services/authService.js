export const login = async (username, password) => {
  const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ "username": username, "password": password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const res = await response.json();
  const data = JSON.parse(res.body);

  if (data?.error) {
    throw new Error('Login failed');
  }

  return data;
};
