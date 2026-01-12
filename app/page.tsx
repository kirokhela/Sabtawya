// File: app/page.tsx
import { neon } from '@neondatabase/serverless';

export default async function Page() {
  const sql = neon(process.env.DATABASE_URL!);

  // READ
  const classes = await sql`
    SELECT class_id, class_name, gender
    FROM classes
    ORDER BY class_id DESC
  `;

  // CREATE
  async function create(formData: FormData) {
    'use server';
    const sql = neon(process.env.DATABASE_URL!);

    const class_name = formData.get('class_name') as string;
    const gender = formData.get('gender') === 'male';

    await sql`
      INSERT INTO classes (class_name, gender)
      VALUES (${class_name}, ${gender})
    `;
  }

  // DELETE
  async function remove(formData: FormData) {
    'use server';
    const sql = neon(process.env.DATABASE_URL!);

    const id = Number(formData.get('class_id'));

    await sql`
      DELETE FROM classes WHERE class_id = ${id}
    `;
  }

  return (
    <main style={{ padding: 20 }}>
      <h2>Create Class</h2>

      <form action={create}>
        <input
          type="text"
          name="class_name"
          placeholder="Class name (مثال: أولى ابتدائي)"
          required
        />

        <select name="gender">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <button type="submit">Create</button>
      </form>

      <hr />

      <h2>Classes</h2>

      <ul>
        {classes.map((c: any) => (
          <li key={c.class_id}>
            {c.class_name} — {c.gender ? 'Male' : 'Female'}

            <form action={remove} style={{ display: 'inline' }}>
              <input type="hidden" name="class_id" value={c.class_id} />
              <button type="submit">❌</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
