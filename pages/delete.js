import { useGetPostsQuery } from '../store/api/apiSlice';

export default function Delete() {
  const { data: employees, error, isLoading } = useGetPostsQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading posts</p>;
    console.log(employees);
  return (
    <div>
      <h1>Employees helolololoo</h1>

      <ul>

        {employees.map((emp) => (
          <li key={emp.id}>{emp.first_name}</li>
        ))}
      </ul>
    </div>
  );
}
