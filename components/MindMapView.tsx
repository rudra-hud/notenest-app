
import React, { useState, useEffect, useRef } from 'react';
import { MindMap, MindMapNode, AccentColor } from '../types';
import { ArrowBackIcon, SaveIcon, AddIcon, DeleteIcon, CenterFocusIcon } from './icons';

interface MindMapViewProps {
    mindMap: MindMap;
    onSave: (mindMap: MindMap) => void;
    onClose: () => void;
    accentColor: AccentColor;
}

const MindMapView: React.FC<MindMapViewProps> = ({ mindMap, onSave, onClose, accentColor }) => {
    const [title, setTitle] = useState(mindMap.title);
    const [nodes, setNodes] = useState<Record<string, MindMapNode>>(mindMap.nodes);
    const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(mindMap.rootId);
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [dragging, setDragging] = useState<{ type: 'pan'; start: { x: number; y: number } } | { type: 'node'; nodeId: string; startPos: {x:number, y:number}; initialNodePos: {x:number, y:number} } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const accentClasses = {
        bg: `bg-${accentColor}-500`,
        hoverBg: `hover:bg-${accentColor}-600`,
        text: `text-${accentColor}-500`,
        border: `border-${accentColor}-500`,
        ring: `ring-${accentColor}-500`,
    };

    const handleCenterView = () => {
        const container = containerRef.current;
        if (container) {
            const { width, height } = container.getBoundingClientRect();
            const rootNode = nodes[mindMap.rootId];
            const rootPos = rootNode ? rootNode.position : { x: 0, y: 0 };
            setView({
                x: width / 2 - rootPos.x * 1, // Target zoom is 1
                y: height / 2 - rootPos.y * 1,
                zoom: 1,
            });
        }
    };

    useEffect(() => {
        handleCenterView();
    }, []);

    const handleSave = () => {
        onSave({ ...mindMap, title, nodes, modifiedAt: Date.now() });
        onClose();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const nodeId = target.closest('[data-node-id]')?.getAttribute('data-node-id');

        if (nodeId) {
            setSelectedNodeId(nodeId);
            setEditingNodeId(null);
            setDragging({ type: 'node', nodeId, startPos: { x: e.clientX, y: e.clientY }, initialNodePos: nodes[nodeId].position });
        } else {
            setDragging({ type: 'pan', start: { x: e.clientX, y: e.clientY } });
        }
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        
        if (dragging.type === 'pan') {
            const dx = e.clientX - dragging.start.x;
            const dy = e.clientY - dragging.start.y;
            setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
            setDragging({ ...dragging, start: { x: e.clientX, y: e.clientY } });
        } else if (dragging.type === 'node') {
            const dx = e.clientX - dragging.startPos.x;
            const dy = e.clientY - dragging.startPos.y;
            const nodeId = dragging.nodeId!;
            setNodes(nds => ({
                ...nds,
                [nodeId]: {
                    ...nds[nodeId],
                    position: {
                        x: dragging.initialNodePos.x + dx / view.zoom,
                        y: dragging.initialNodePos.y + dy / view.zoom,
                    }
                }
            }));
        }
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    const handleWheel = (e: React.WheelEvent) => {
        const zoomFactor = 1.1;
        const newZoom = e.deltaY < 0 ? view.zoom * zoomFactor : view.zoom / zoomFactor;
        const newZoomClamped = Math.max(0.1, Math.min(5, newZoom));
        
        const rect = containerRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const newX = mouseX - (mouseX - view.x) * (newZoomClamped / view.zoom);
        const newY = mouseY - (mouseY - view.y) * (newZoomClamped / view.zoom);

        setView({ x: newX, y: newY, zoom: newZoomClamped });
    };

    const handleAddChildNode = () => {
        if (!selectedNodeId) return;
        const parentNode = nodes[selectedNodeId];
        const now = Date.now();
        const newNodeId = `node_${now}`;
        const newNode: MindMapNode = {
            id: newNodeId,
            text: 'New Idea',
            parentId: selectedNodeId,
            position: { x: parentNode.position.x + 150, y: parentNode.position.y + 50 },
        };
        setNodes(nds => ({ ...nds, [newNodeId]: newNode }));
        setSelectedNodeId(newNodeId);
        setEditingNodeId(newNodeId);
    };
    
    const handleDeleteNode = () => {
        if (!selectedNodeId || selectedNodeId === mindMap.rootId) return;
        
        let toDelete = [selectedNodeId];
        let i = 0;
        while(i < toDelete.length) {
            const currentId = toDelete[i];
            const children = Object.values(nodes).filter(n => n.parentId === currentId).map(n => n.id);
            toDelete.push(...children);
            i++;
        }

        setNodes(nds => {
            const newNds = { ...nds };
            toDelete.forEach(id => delete newNds[id]);
            return newNds;
        });
        setSelectedNodeId(mindMap.rootId);
    }
    
    const updateNodeText = (nodeId: string, text: string) => {
        if(text.trim()){
            setNodes(nds => ({...nds, [nodeId]: {...nds[nodeId], text}}));
        }
        setEditingNodeId(null);
    }

    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-20 flex flex-col">
            <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ArrowBackIcon /></button>
                 <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="flex-grow text-center bg-transparent text-xl font-bold focus:outline-none dark:text-white"
                />
                <button onClick={handleSave} className={`${accentClasses.bg} ${accentClasses.hoverBg} text-white px-4 py-2 rounded-full flex items-center space-x-2 transition`}>
                    <SaveIcon />
                    <span>Save & Close</span>
                </button>
            </header>

            <div 
                ref={containerRef}
                className="flex-grow w-full h-full cursor-move overflow-hidden relative"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <div className="absolute inset-0 bg-dots"></div>
                <div 
                    className="absolute" 
                    style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`, transformOrigin: '0 0' }}
                >
                    {/* Connectors */}
                    <svg className="absolute overflow-visible pointer-events-none">
                        {Object.values(nodes).map(node => {
                            if (!node.parentId) return null;
                            const parent = nodes[node.parentId];
                            if (!parent) return null;

                            const startX = parent.position.x;
                            const startY = parent.position.y;
                            const endX = node.position.x;
                            const endY = node.position.y;
                            const c1X = startX + (endX - startX) * 0.5;
                            const c1Y = startY;
                            const c2X = startX + (endX - startX) * 0.5;
                            const c2Y = endY;

                            return <path key={`${node.parentId}-${node.id}`} d={`M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`} stroke="#9ca3af" strokeWidth="2" fill="none" />
                        })}
                    </svg>

                    {/* Nodes */}
                    {Object.values(nodes).map(node => (
                        <div
                            key={node.id}
                            data-node-id={node.id}
                            className={`absolute p-1 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 rounded-lg transition-all duration-150 ${selectedNodeId === node.id ? `ring-2 ${accentClasses.ring} z-10` : 'z-0'}`}
                            style={{ left: node.position.x, top: node.position.y }}
                            onDoubleClick={() => {setSelectedNodeId(node.id); setEditingNodeId(node.id)}}
                        >
                            {editingNodeId === node.id ? (
                                <input
                                    type="text"
                                    defaultValue={node.text}
                                    autoFocus
                                    onBlur={(e) => updateNodeText(node.id, e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                    className="w-32 bg-white dark:bg-gray-700 p-2 rounded-md shadow-lg border border-gray-300 dark:border-gray-600 focus:outline-none"
                                />
                            ) : (
                                <div className="w-32 bg-white dark:bg-gray-800 p-2 rounded-md shadow-lg text-center break-words">
                                    {node.text}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
             {/* Toolbar */}
             <div className="absolute bottom-24 right-6 flex flex-col space-y-2 z-10">
                <button onClick={handleCenterView} title="Center View" className="w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white shadow-lg flex items-center justify-center transition-transform transform hover:scale-105">
                    <CenterFocusIcon/>
                </button>
                {selectedNodeId && (
                    <>
                    <button onClick={handleAddChildNode} title="Add Child Node" className={`w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center transition-transform transform hover:scale-105 ${accentClasses.bg} ${accentClasses.hoverBg}`}>
                        <AddIcon/>
                    </button>
                    {selectedNodeId !== mindMap.rootId &&
                        <button onClick={handleDeleteNode} title="Delete Node" className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center transition-transform transform hover:scale-105">
                            <DeleteIcon/>
                        </button>
                    }
                    </>
                )}
             </div>
             <style>{`.bg-dots { background-image: radial-gradient(#d2d6dc 1px, transparent 0); background-size: 20px 20px; } .dark .bg-dots { background-image: radial-gradient(#4b5563 1px, transparent 0); }`}</style>
        </div>
    );
};

export default MindMapView;