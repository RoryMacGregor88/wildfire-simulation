const Error = ({ message }: { message: string }) => (
  <div className='invalid-feedback w-auto d-block'>{message ?? ''}</div>
);

export default Error;
