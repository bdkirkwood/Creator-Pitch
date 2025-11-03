import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TodoItem } from '../types';
import { PlusIcon, TrashIcon, ArchiveIcon, UnarchiveIcon, EditIcon, CalendarIcon, XCircleIcon, ChevronRightIcon, DuplicateIcon, ArrowUpIcon, ArrowDownIcon } from '../constants';

const linkify = (text: string) => {
    if (!text) return '';
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/ig;
    let linkedText = text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${url}</a>`);
    linkedText = linkedText.replace(emailRegex, (email) => `<a href="mailto:${email}" class="text-blue-400 hover:underline">${email}</a>`);
    return linkedText;
};

interface AddTaskFormProps {
    onSubmit: (subject: string, description: string, dueDate: string) => void;
    onCancel: () => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onSubmit, onCancel }) => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim()) return;
        onSubmit(subject, description, dueDate);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-4">
            <div>
                <label htmlFor="task-title" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">New Task Title</label>
                <input
                    id="task-title" type="text" placeholder="Follow up with..." value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required autoFocus
                />
            </div>
            <div>
                <label htmlFor="task-description" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Task Description</label>
                <textarea
                    id="task-description" placeholder="Add more details... (optional)" value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows={2}
                />
            </div>
            <div>
                 <label htmlFor="task-due-date" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Task Due Date</label>
                 <input
                    id="task-due-date" type="date" value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600"
                />
            </div>
            <div className="flex justify-end items-center space-x-2 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300" disabled={!subject.trim()}>Add Task</button>
            </div>
        </form>
    );
};


interface TodoListProps {
  todos: TodoItem[];
  onAdd: (subject: string, description: string, dueDate?: string) => void;
  onUpdate: (todo: TodoItem) => void;
  onDelete: (todoId: string) => void;
  onDuplicate: (todoId: string) => void;
  onReorder: (todoId: string, direction: 'up' | 'down') => void;
  onClose: () => void;
  // FIX: Add onToggleComplete and completingTodoId to props to fix type errors in App.tsx
  onToggleComplete: (todoId: string) => void;
  completingTodoId: string | null;
}

interface TodoListItemProps {
    todo: TodoItem;
    onUpdate: (todo: TodoItem) => void;
    onDelete: (todoId: string) => void;
    onDuplicate: (todoId: string) => void;
    onReorder: (todoId: string, direction: 'up' | 'down') => void;
    onToggleComplete: (todoId: string) => void;
    isFirst: boolean;
    isLast: boolean;
    isOverdue: boolean;
    isCompleting: boolean;
}

const TodoListItem: React.FC<TodoListItemProps> = ({ todo, onUpdate, onDelete, onDuplicate, onReorder, onToggleComplete, isFirst, isLast, isOverdue, isCompleting }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [subject, setSubject] = useState(todo.subject);
    const [description, setDescription] = useState(todo.description);
    const [dueDate, setDueDate] = useState(todo.dueDate ? todo.dueDate.split('T')[0] : '');

    const handleToggleArchive = () => {
        onUpdate({ ...todo, isArchived: !todo.isArchived });
    };

    const handleSave = () => {
        const updatedTodo = {
            ...todo,
            subject: subject.trim() || 'Untitled Task',
            description: description,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        };
        onUpdate(updatedTodo);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setSubject(todo.subject);
        setDescription(todo.description);
        setDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm border border-blue-500">
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full font-semibold mb-2 p-1 border rounded bg-white dark:bg-slate-600 dark:border-slate-500"
                    placeholder="Task Subject"
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-sm mb-2 p-1 border rounded bg-white dark:bg-slate-600 dark:border-slate-500"
                    placeholder="Description (optional)"
                    rows={2}
                />
                <div className="flex items-center mb-3">
                    <CalendarIcon className="h-4 w-4 mr-2 text-slate-500" />
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="text-xs text-slate-500 dark:text-slate-400 p-1 border rounded bg-white dark:bg-slate-600 dark:border-slate-500"
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <button onClick={handleCancel} className="px-3 py-1 text-sm bg-gray-200 dark:bg-slate-600 rounded">Cancel</button>
                    <button onClick={handleSave} className="px-3 py-1 text-sm bg-blue-500 text-white rounded">Save</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`p-3 rounded-lg shadow-sm transition-all duration-300 relative group ${todo.isCompleted ? 'bg-gray-100 dark:bg-slate-800/50 opacity-70' : 'bg-white dark:bg-slate-700'} ${isCompleting ? 'animate-fade-out' : ''}`}>
            <div className="flex items-start">
                <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={() => onToggleComplete(todo.id)}
                    className="h-5 w-5 rounded border-gray-300 dark:border-slate-500 text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div className="ml-3 flex-grow min-w-0"> {/* Added min-w-0 to prevent flexbox overflow */}
                    <p className={`font-semibold ${todo.isCompleted ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>{todo.subject}</p>
                    {todo.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 break-words" dangerouslySetInnerHTML={{ __html: linkify(todo.description) }}></p>}
                    
                    <div className="flex items-end justify-between text-xs mt-2">
                        <div className="flex items-center flex-shrink-0">
                            {todo.dueDate && (
                                <div className={`flex items-center ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                    <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
                                </div>
                            )}
                             {isOverdue && <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">Overdue</span>}
                        </div>
                         {!todo.isCompleted && !todo.isArchived && (
                             <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onReorder(todo.id, 'up')} disabled={isFirst} className="p-0.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-20"><ArrowUpIcon className="h-4 w-4"/></button>
                                <button onClick={() => onReorder(todo.id, 'down')} disabled={isLast} className="p-0.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-20"><ArrowDownIcon className="h-4 w-4"/></button>
                            </div>
                         )}
                    </div>
                </div>
                <div className="absolute top-2 right-2 flex-shrink-0 flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!todo.isCompleted && <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-blue-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600"><EditIcon className="h-4 w-4"/></button>}
                    <button onClick={() => onDuplicate(todo.id)} className="p-1 text-slate-400 hover:text-indigo-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600" title="Duplicate Task">
                        <DuplicateIcon className="h-4 w-4"/>
                    </button>
                    <button onClick={handleToggleArchive} className="p-1 text-slate-400 hover:text-amber-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600" title={todo.isArchived ? 'Unarchive' : 'Archive'}>
                        {todo.isArchived ? <UnarchiveIcon className="h-4 w-4" /> : <ArchiveIcon className="h-4 w-4" />}
                    </button>
                    <button onClick={() => onDelete(todo.id)} className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600" title="Delete Task"><TrashIcon className="h-4 w-4"/></button>
                </div>
            </div>
        </div>
    );
};

const TodoList: React.FC<TodoListProps> = ({ todos, onAdd, onUpdate, onDelete, onDuplicate, onReorder, onClose, onToggleComplete, completingTodoId }) => {
    const [isAddTaskFormVisible, setIsAddTaskFormVisible] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    const activeTodos = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        const isOverdue = (todo: TodoItem) => !todo.isCompleted && todo.dueDate && new Date(todo.dueDate) < today;

        return todos
            .filter(t => !t.isCompleted && !t.isArchived)
            .sort((a, b) => {
                const aIsOverdue = isOverdue(a);
                const bIsOverdue = isOverdue(b);
                if (aIsOverdue && !bIsOverdue) return -1;
                if (!aIsOverdue && bIsOverdue) return 1;
                return (a.order || 0) - (b.order || 0); 
            });
    }, [todos]);

    const completedTodos = useMemo(() => todos.filter(t => t.isCompleted && !t.isArchived).sort((a, b) => (b.completedAt && a.completedAt) ? new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime() : 0), [todos]);
    const archivedTodos = useMemo(() => todos.filter(t => t.isArchived), [todos]);

    const handleAddTask = (subject: string, description: string, dueDate: string) => {
        onAdd(subject, description, dueDate);
        setIsAddTaskFormVisible(false);
    };
    
    return (
        <div
            className="h-full bg-gray-50 dark:bg-slate-900 shadow-2xl flex flex-col"
        >
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                <h2 className="text-lg font-bold">To-Do List</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><XCircleIcon className="h-6 w-6 text-slate-500" /></button>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto flex flex-col">
                <div className="flex-shrink-0">
                    {!isAddTaskFormVisible && (
                         <button onClick={() => setIsAddTaskFormVisible(true)} className="w-full flex items-center justify-center p-3 mb-4 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow">
                            <PlusIcon /> <span className="ml-2">Add Task</span>
                        </button>
                    )}
                    {isAddTaskFormVisible && <AddTaskForm onSubmit={handleAddTask} onCancel={() => setIsAddTaskFormVisible(false)} />}
                </div>

                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    <h3 className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Active ({activeTodos.length})</h3>
                    <div className="space-y-2">
                        {activeTodos.length > 0 ? activeTodos.map((todo, index) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const isOverdue = !todo.isCompleted && todo.dueDate && new Date(todo.dueDate) < today;
                            return (
                                <TodoListItem 
                                  key={todo.id} 
                                  todo={todo} 
                                  onUpdate={onUpdate} 
                                  onDelete={onDelete} 
                                  onDuplicate={onDuplicate} 
                                  onReorder={onReorder}
                                  onToggleComplete={onToggleComplete}
                                  isFirst={index === 0}
                                  isLast={index === activeTodos.length - 1}
                                  isOverdue={isOverdue}
                                  isCompleting={todo.id === completingTodoId}
                                />
                            );
                        }) : <p className="text-sm text-slate-500 italic p-3 text-center">No active tasks. Great job!</p>}
                    </div>
                </div>
                
                <div className="flex-shrink-0 pt-4">
                     {completedTodos.length > 0 && (
                         <div>
                            <button onClick={() => setShowCompleted(!showCompleted)} className="font-semibold text-slate-600 dark:text-slate-300 mb-2 w-full text-left flex justify-between items-center p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800">
                                <span>Completed ({completedTodos.length})</span>
                                <span className={`transform transition-transform ${showCompleted ? 'rotate-90' : ''}`}><ChevronRightIcon/></span>
                            </button>
                            {showCompleted && (
                                <div className="space-y-2 border-l-2 border-slate-200 dark:border-slate-700 pl-3 ml-1 max-h-48 overflow-y-auto pr-2 -mr-2">
                                    {completedTodos.map(todo => {
                                         const today = new Date();
                                         today.setHours(0, 0, 0, 0);
                                         const isOverdue = !todo.isCompleted && todo.dueDate && new Date(todo.dueDate) < today;
                                        return (
                                            <TodoListItem 
                                              key={todo.id} 
                                              todo={todo} 
                                              onUpdate={onUpdate} 
                                              onDelete={onDelete} 
                                              onDuplicate={onDuplicate}
                                              onReorder={onReorder}
                                              onToggleComplete={onToggleComplete}
                                              isFirst={true} isLast={true} // Reordering not applicable here
                                              isOverdue={isOverdue}
                                              isCompleting={false}
                                            />
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                   
                    {archivedTodos.length > 0 && (
                        <div className={completedTodos.length > 0 ? 'mt-2' : ''}>
                            <button onClick={() => setShowArchived(!showArchived)} className="font-semibold text-slate-600 dark:text-slate-300 mb-2 w-full text-left flex justify-between items-center p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800">
                                <span>Archived ({archivedTodos.length})</span>
                                <span className={`transform transition-transform ${showArchived ? 'rotate-90' : ''}`}><ChevronRightIcon/></span>
                            </button>
                            {showArchived && (
                                <div className="space-y-2 border-l-2 border-slate-200 dark:border-slate-700 pl-3 ml-1 max-h-48 overflow-y-auto pr-2 -mr-2">
                                    {archivedTodos.map(todo => {
                                         const today = new Date();
                                         today.setHours(0, 0, 0, 0);
                                         const isOverdue = !todo.isCompleted && todo.dueDate && new Date(todo.dueDate) < today;
                                        return (
                                            <TodoListItem 
                                              key={todo.id} 
                                              todo={todo} 
                                              onUpdate={onUpdate} 
                                              onDelete={onDelete} 
                                              onDuplicate={onDuplicate}
                                              onReorder={onReorder}
                                              onToggleComplete={() => {}} // Not applicable for archived
                                              isFirst={true} isLast={true} // Reordering not applicable here
                                              isOverdue={isOverdue}
                                              isCompleting={false}
                                            />
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodoList;