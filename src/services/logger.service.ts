const { Webhook, MessageBuilder } = require("discord-webhook-node");
const hook = new Webhook(
  "https://discord.com/api/webhooks/1031700815750115359/bmxBS6SYQQxF7r7dljbfKRYF96BfGuSlgEa08xHPXWfGDLx1SDOKWEw5iHVVFOXzLxFk"
);

const consoleInterceptor = async () => {
  var capcon = require("capture-console");

  capcon.startCapture(process.stdout, async (stdout: any) => {
    sendWebhook({ message: stdout, type: "normal" });
  });

  capcon.startCapture(process.stderr, async (stderr: any) => {
    sendWebhook({ message: stderr, type: "error" });
  });
};

const sendWebhook = (params: {
  message: string;
  type: "normal" | "error" | "warning";
}) => {
  const embed = new MessageBuilder();
  embed
    .setTitle(`Log level: ${params.type}`)
    .setAuthor("Serial Luncher", "https://i.imgur.com/uRcbhRu.png")
    .setDescription(params.message)
    // green hex color
    .setColor(
      params.type === "normal"
        ? "#00bf33"
        : params.type === "warning"
        ? "#ff8800"
        : "#ff0000"
    )
    .setFooter(`serial-luncher-server v${process.env.VERSION}`)
    .setTimestamp();
  hook.send(embed);
};

export const logger = {
  console: consoleInterceptor,
  webhook: sendWebhook,
};
