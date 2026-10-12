export default function MeshWriteList({ meshwrites, emptyText }) {
  if (meshwrites.length === 0) {
    return <p className="profile-empty">{emptyText}</p>;
  }

  return (
    <ul className="meshwrite-grid">
      {meshwrites.map((write) => (
        <li key={write.id}>
          <a className="meshwrite-card" href={`/meshwrite/view/${write.id}`}>
            <span className="meshwrite-title">{write.title}</span>
            <span className="meshwrite-excerpt">{write.content}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
