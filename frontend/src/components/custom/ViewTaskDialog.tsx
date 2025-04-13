import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Progress } from "../ui/progress";
import { Checkbox } from "../ui/checkbox";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BACKEND_URL } from "../../config";

const ViewTaskDialog = ({
  contractData,
  contractId,
  user,
  onTasksUpdated, // Optional callback when tasks are updated
}: {
  contractData: any[];
  user: any;
  contractId: string;
  onTasksUpdated?: (updatedTasks: any[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksToUpdate, setTasksToUpdate] = useState<{
    [key: string]: boolean;
  }>({});
  const [client, setClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    taskId: "",
    isCompleted: false,
  });
  console.log(contractData);
  useEffect(() => {
    const isClient = user?.role === "client" ? true : false;
    setClient(isClient);
    if (Array.isArray(contractData)) {
      setTasks(
        contractData.map((task) => ({
          ...task,
          id: task._id, // Ensure each task has an id property that maps to _id
        }))
      );
    }
  }, [contractData]);

  const handleOpen = () => {
    if (Array.isArray(contractData) && contractData.length > 0) {
      // Reset the tasks to update when opening the dialog
      setTasksToUpdate({});
      setOpen(true);
    } else {
      toast.error("No tasks available");
      console.error("No tasks available in contractData:", contractData);
    }
  };

  const handleTaskSelect = (task: any) => {
    setSelectedTask(task === selectedTask ? null : task);
  };

  const handleTaskToggle = (taskId: string, isCompleted: boolean) => {
    // Check if this would be the last task to complete
    if (isCompleted) {
      const otherTasksCompleted = tasks.filter(
        (task) => task.id !== taskId && task._id !== taskId && task.isCompleted
      ).length;
      const totalTasks = tasks.length;

      // If this would be the last task to complete, show confirmation dialog
      if (otherTasksCompleted === totalTasks - 1) {
        setConfirmationDialog({
          open: true,
          taskId,
          isCompleted,
        });
        return;
      }
    }

    // Store tasks that need to be updated
    setTasksToUpdate((prev) => ({
      ...prev,
      [taskId]: isCompleted,
    }));

    // Update local state to reflect changes immediately for UI feedback
    setTasks(
      tasks.map((task) =>
        task.id === taskId || task._id === taskId
          ? { ...task, isCompleted, percentage: isCompleted ? 100 : 0 }
          : task
      )
    );

    // If the selected task is being updated, update that too
    if (
      selectedTask &&
      (selectedTask.id === taskId || selectedTask._id === taskId)
    ) {
      setSelectedTask({
        ...selectedTask,
        isCompleted,
        percentage: isCompleted ? 100 : 0,
      });
    }
  };

  const handleConfirmation = async (confirmed: boolean) => {
    const { taskId, isCompleted } = confirmationDialog;

    // Close confirmation dialog regardless of choice
    setConfirmationDialog({ open: false, taskId: "", isCompleted: false });

    if (!confirmed) {
      return; // User declined to complete the contract
    }

    // Update the task with confirmation
    setTasksToUpdate((prev) => ({
      ...prev,
      [taskId]: isCompleted,
    }));

    // Update local state
    setTasks(
      tasks.map((task) =>
        task.id === taskId || task._id === taskId
          ? { ...task, isCompleted, percentage: isCompleted ? 100 : 0 }
          : task
      )
    );

    if (
      selectedTask &&
      (selectedTask.id === taskId || selectedTask._id === taskId)
    ) {
      setSelectedTask({
        ...selectedTask,
        isCompleted,
        percentage: isCompleted ? 100 : 0,
      });
    }

    // If this is the only task being changed, save immediately
    if (Object.keys(tasksToUpdate).length === 0) {
      try {
        setIsSubmitting(true);
        await axios.post(
          `${BACKEND_URL}/api/contract/task/${contractId}`,
          { taskId, isCompleted, confirmedFinal: true },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success("Contract completed successfully!");

        // Call the callback if provided
        if (onTasksUpdated) {
          onTasksUpdated(
            tasks.map((task) =>
              task.id === taskId || task._id === taskId
                ? { ...task, isCompleted, percentage: isCompleted ? 100 : 0 }
                : task
            )
          );
        }

        // Close dialog after saving
        setOpen(false);
      } catch (error) {
        console.error("Error updating tasks:", error);
        toast.error("Failed to complete contract");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (Object.keys(tasksToUpdate).length === 0) {
      toast.success("No changes to save");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if completing the contract
      const willCompleteAllTasks = tasks.every(
        (task) =>
          task.isCompleted || tasksToUpdate[task.id || task._id] === true
      );

      // Update each task that has changed
      const updatePromises = Object.entries(tasksToUpdate).map(
        ([taskId, isCompleted]) => {
          return axios.post(
            `${BACKEND_URL}/api/contract/task/${contractId}`,
            {
              taskId,
              isCompleted,
              confirmedFinal: willCompleteAllTasks, // Add confirmedFinal if all tasks are completed
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }
      );

      const results = await Promise.all(updatePromises);

      // Check if any response indicates contract completion
      const contractCompleted = results.some(
        (res) => res.data.isContractCompleted
      );

      if (contractCompleted) {
        toast.success(
          "All tasks completed! Contract has been marked as complete."
        );
      } else {
        toast.success("Tasks updated successfully");
      }

      // Reset tasks to update
      setTasksToUpdate({});

      // Call the callback if provided
      if (onTasksUpdated) {
        onTasksUpdated(tasks);
      }

      // Close dialog after saving
      setOpen(false);
    } catch (error) {
      console.error("Error updating tasks:", error);
      toast.error("Failed to update tasks");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {contractData.length > 0 ? (
        <Button onClick={handleOpen}>View Tasks</Button>
      ) : (
        <></>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Task List</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <div
                  key={task.id || task._id || index}
                  className="border rounded-lg p-3"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleTaskSelect(task)}
                  >
                    <h3 className="font-medium">
                      {task.heading || `Task ${index + 1}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      {client && (
                        <Checkbox
                          id={`task-${task.id || task._id || index}`}
                          checked={task.isCompleted}
                          onCheckedChange={(checked) => {
                            handleTaskToggle(
                              task.id || task._id || `${index}`,
                              checked === true
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <span className="text-xs">{task.percentage || 0}%</span>
                    </div>
                  </div>

                  {selectedTask === task && (
                    <div className="mt-3 pl-2 border-l-2 border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        {task.description || "No description available."}
                      </p>
                      {task.percentage !== 100 ? (
                        <Progress
                          value={task.percentage || 0}
                          className="h-2"
                        />
                      ) : (
                        <div>Tast completed</div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No tasks available</p>
            )}
          </div>

          {client && tasks.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleSaveChanges}
                disabled={
                  isSubmitting || Object.keys(tasksToUpdate).length === 0
                }
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Final Task */}
      <Dialog
        open={confirmationDialog.open}
        onOpenChange={(open) => !open && handleConfirmation(false)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Contract</DialogTitle>
            <DialogDescription>
              This is the last task. Completing it will mark the entire contract
              as complete. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => handleConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleConfirmation(true)}>
              Complete Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewTaskDialog;
