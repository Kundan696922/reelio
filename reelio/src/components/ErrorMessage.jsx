export default function ErrorMessage({ message }) {
  return (
    <div className="error-message">
      <p>{message || 'Something went wrong.'}</p>
    </div>
  );
}
