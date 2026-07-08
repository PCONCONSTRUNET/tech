export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', width: '100%' }}>
      <div className="custom-loader" />
      <style>{`
        .custom-loader {
          display: block;
          --height-of-loader: 4px;
          --loader-color: var(--color-primary, #4f46e5); /* Usando a cor primária do sistema */
          width: 130px;
          height: var(--height-of-loader);
          border-radius: 30px;
          background-color: rgba(0,0,0,0.1);
          position: relative;
        }

        .custom-loader::before {
          content: "";
          position: absolute;
          background: var(--loader-color);
          top: 0;
          left: 0;
          width: 0%;
          height: 100%;
          border-radius: 30px;
          animation: moving 1s ease-in-out infinite;
        }

        @keyframes moving {
          50% {
            width: 100%;
          }
          100% {
            width: 0;
            right: 0;
            left: unset;
          }
        }
      `}</style>
    </div>
  );
}
