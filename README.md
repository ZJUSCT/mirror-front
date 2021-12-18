# ZJU Mirror Front-end

back-end JSON format: [mirrorz-json](https://github.com/mirrorz-org/mirrorz#data-format-v15-draft)

## Development Environment Configuration

Create a ssh tunnel, forwarding remote api port to `localhost:2345`:

```shell
ssh -L 2345:localhost:${remote_port} ${remote_user}@${remote_host}
```