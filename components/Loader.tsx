export default function Loader() {
  return (
    <div className="loading-container">
      <video src="/loader.webm" autoPlay loop muted playsInline style={{ width: 120, height: 120 }} />
    </div>
  );
}
