import bcrypt from 'bcrypt';

const hash = async () => {
  const hashed = await bcrypt.hash('test-secret', 10);
  console.log(hashed);
  process.exit(0);
};

hash();