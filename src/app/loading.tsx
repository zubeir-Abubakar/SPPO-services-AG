export default function Loading() {
  return (
    <div className="ppo-loader" role="status" aria-label="Loading">
      <span className="ppo-loader__stage" aria-hidden="true">
        <span className="ppo-loader__halo" />
        <img
          className="ppo-loader__mark"
          src="/ppo/_assets/1a1c4462d009da437855101cc7ff64ea/Images/ppo-icon.svg"
          alt=""
        />
      </span>
    </div>
  );
}
