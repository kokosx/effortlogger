import { api } from "../trpc/server";

const page = async () => {
  const user = await api.auth.getUser();
  return (
    <div>
      Landing page
      <p>{user?.id ? `username is ${user.name}` : "User is not logged in"}</p>
    </div>
  );
};

export default page;
