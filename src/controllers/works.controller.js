const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function sendMessage(req, res) {
    const { workId, destinationUserId, content } = req.body;

    try {
        if (workId) {
            const message = await prisma.message.create({
                data: {
                    from: req.user.id,
                    to: destinationUserId,
                    content: content,
                    seen: false,
                    workId: workId,
                },
            });
            return res.status(200).json({ message: "Message sent successfully", data: message });
        } else {
            const newWork = await prisma.work.create({
                data: {
                    clientId: req.user.id,
                    taskerId: destinationUserId,
                },
            });

            const message = await prisma.message.create({
                data: {
                    from: req.user.id,
                    to: destinationUserId,
                    content: content,
                    seen: false,
                    workId: newWork.id,
                },
            });
            return res.status(200).json({ message: "Message sent successfully", data: message });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ error: "An error occurred while sending the message" });
    }
}

async function updateWork(req, res) {
    const workId = parseInt(req.params.id);
    const { /* Update fields */ } = req.body;

    try {
        const updatedWork = await prisma.work.update({
            where: { id: workId },
            data: {
                // Update the fields as needed
            },
        });

        return res.status(200).json({ message: "Work updated successfully", data: updatedWork });
    } catch (error) {
        console.error("Error updating work:", error);
        return res.status(500).json({ error: "An error occurred while updating the work" });
    }
}

async function deleteWork(req, res) {
    const workId = parseInt(req.params.id);

    try {
        await prisma.message.deleteMany({ where: { workId: workId } });
        await prisma.workReview.deleteMany({ where: { workId: workId } });
        await prisma.work.delete({ where: { id: workId } });

        return res.status(200).json({ message: "Work deleted successfully" });
    } catch (error) {
        console.error("Error deleting work:", error);
        return res.status(500).json({ error: "An error occurred while deleting the work" });
    }
}

module.exports = { sendMessage, updateWork, deleteWork };
