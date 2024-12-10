interface UserNameOptions {
  first_name?: string;
  username?: string;
  id: string;
  name: string | null;
}

function generateName({
  first_name,
  username,
  id,
  name,
}: UserNameOptions): string {
  // Если имя присутствует, возвращаем его
  if (name) return name;

  // Если есть first_name, возвращаем его или username, иначе возвращаем ID
  return first_name?.trim() || username || `ID: ${id}`;
}

export default generateName;
