const { PrismaClient } = require("@prisma/client");
const { StatusCodes } = require("http-status-codes");
const prisma = new PrismaClient();

async function sendMessage(req, res) {
    const { workId, destinationUserId, content ,categoryId} = req.body;
    try {
        if (workId) {
            const existingWork = await prisma.work.findUnique({
                where: {
                    id: workId,
                },
            });

            
            if (existingWork) {
                if ([existingWork.clientId, existingWork.taskerId].sort().join(',') !== [req.user.userId, destinationUserId].sort().join(',')) {
                    return res.status(StatusCodes.FORBIDDEN).json({ error: 'You must belong to this work' });
                }
                if (req.user.userId=== destinationUserId){
                    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'You cannot send a message to yourself' });
                }


                const message = await prisma.message.create({
                    data: {
                        from: req.user.userId,
                        to: parseInt(destinationUserId),
                        content: content,
                        seen: false,
                        workId: workId,
                    },
                });
                return res.status(200).json({ message: "Message sent successfully", data: message });
            } else {
                return res.status(404).json({ error: "Work not found with the provided ID" });
            }
        } else {
            let clientId =  (req.user.role == "client" ) ? req.user.userId : parseInt(destinationUserId)
            let taskerId = (req.user.role === "tasker") ? req.user.userId : parseInt(destinationUserId)
            const newWork = await prisma.work.create({
                data: {
                    clientId: clientId,
                    taskerId:  taskerId,
                    categoryId : parseInt(categoryId)
                },
            });

            const message = await prisma.message.create({
                data: {
                    from: req.user.userId,
                    to: parseInt(destinationUserId),
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
    const { status } = req.body;

    try {

        const existingWork = await prisma.work.findUnique({
            where: { id: workId },
            include: {
                messages: true,
                client: true,
            },
        });

        // Check if the work exists
        if (!existingWork) {
            return res.status(404).json({ error: "Work not found" });
        }

        // Check if the requested status transition is valid
        if (existingWork.status === "created" && status === "started") {
            // Verify that the user is a client
            if (req.user.role !== "client" || req.user.userId !== existingWork.clientId) {
                return res.status(403).json({ error: "You must be a client to start the work" });
            }
            // Verify that the tasker has sent at least one message
            if (existingWork.messages.length === 0) {
                return res.status(400).json({ error: "The tasker must send at least one message before starting the work" });
            }
        }
        else if(existingWork.status === "started" && status === "canceled"){
            
        }

        const updatedWork = await prisma.work.update({
            where: { id: workId },
            data: {
                status: status,
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
        await prisma.work.delete({ where: { id: workId } });
 
        return res.status(200).json({ message: "Work deleted successfully" });
    } catch (error) {
        console.error("Error deleting work:", error);
        return res.status(500).json({ error: "An error occurred while deleting the work" });
    }
}

module.exports = { sendMessage, updateWork, deleteWork };
