export interface UserCardProps {
  username: string;
  email: string;
}

export default function UserCard({ username, email }: UserCardProps) {
  return (
    <div>
      <h2>{username}</h2>
      <p>{email}</p>
    </div>
  );
}
