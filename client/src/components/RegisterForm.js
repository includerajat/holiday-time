const RegisterForm = ({
  handleSubmit,
  name,
  email,
  password,
  setName,
  setEmail,
  setPassword,
}) => (
  <form onSubmit={handleSubmit} className="mt-3">
    <div className="form-group mb-3">
      <label className="form-label">Your name</label>
      <input
        type="text"
        className="form-control"
        placeholder="Enter name"
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
    </div>
    <div className="form-group mb-3">
      <label className="form-label">Email address</label>
      <input
        type="email"
        className="form-control"
        placeholder="Enter email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
    </div>
    <div className="form-group mb-3">
      <label className="form-label">Password</label>
      <input
        type="password"
        className="form-control"
        placeholder="Enter password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
    </div>
    <button disabled={!name || !email || !password} className="btn btn-primary">
      Submit
    </button>
  </form>
);

export default RegisterForm;
